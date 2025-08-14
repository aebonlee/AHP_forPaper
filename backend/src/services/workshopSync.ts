/**
 * 실시간 워크숍 동기화 서비스
 * WebSocket을 통한 실시간 협업 기능
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';

interface WorkshopParticipant {
  socketId: string;
  userId: number;
  evaluatorCode: string;
  evaluatorName: string;
  isActive: boolean;
  lastSeen: Date;
}

interface WorkshopRoom {
  projectId: string;
  projectName: string;
  participants: Map<string, WorkshopParticipant>;
  adminId: number;
  startTime: Date;
  status: 'waiting' | 'active' | 'paused' | 'completed';
}

class WorkshopSyncService {
  private io: SocketIOServer;
  private workshops = new Map<string, WorkshopRoom>();
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "https://ahp-frontend-render.onrender.com"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket) => {
      console.log(`Workshop client connected: ${socket.id}`);

      // 워크숍 참가
      socket.on('join-workshop', this.handleJoinWorkshop.bind(this, socket));
      
      // 워크숍 퇴장
      socket.on('leave-workshop', this.handleLeaveWorkshop.bind(this, socket));
      
      // 진행상황 업데이트
      socket.on('progress-update', this.handleProgressUpdate.bind(this, socket));
      
      // 평가 입력 실시간 공유
      socket.on('evaluation-update', this.handleEvaluationUpdate.bind(this, socket));
      
      // 일관성 체크 결과 공유
      socket.on('consistency-check', this.handleConsistencyCheck.bind(this, socket));
      
      // 관리자 명령
      socket.on('admin-command', this.handleAdminCommand.bind(this, socket));
      
      // 연결 해제
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  private async authenticateSocket(socket: any, next: any) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
      
      // 사용자 정보 조회
      const userQuery = await query(
        'SELECT id, email, name, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userQuery.rowCount === 0) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = decoded.userId;
      socket.userInfo = userQuery.rows[0];
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private async handleJoinWorkshop(socket: any, data: { projectId: string; accessKey?: string }) {
    try {
      const { projectId, accessKey } = data;
      const userId = socket.userId;

      // 프로젝트 및 평가자 정보 확인
      let evaluatorQuery;
      if (accessKey) {
        // 접속키로 평가자 확인
        evaluatorQuery = await query(
          `SELECT pe.*, u.name as evaluator_name, p.title as project_name
           FROM project_evaluators pe
           JOIN users u ON pe.evaluator_id = u.id
           JOIN projects p ON pe.project_id = p.id
           WHERE pe.project_id = $1 AND pe.access_key = $2`,
          [projectId, accessKey]
        );
      } else {
        // 일반 사용자 확인
        evaluatorQuery = await query(
          `SELECT pe.*, u.name as evaluator_name, p.title as project_name
           FROM project_evaluators pe
           JOIN users u ON pe.evaluator_id = u.id
           JOIN projects p ON pe.project_id = p.id
           WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
          [projectId, userId]
        );
      }

      if (evaluatorQuery.rowCount === 0) {
        socket.emit('workshop-error', { message: '워크숍 참가 권한이 없습니다.' });
        return;
      }

      const evaluatorInfo = evaluatorQuery.rows[0];
      
      // 워크숍 룸 생성 또는 조회
      if (!this.workshops.has(projectId)) {
        // 관리자 확인
        const projectQuery = await query(
          'SELECT created_by FROM projects WHERE id = $1',
          [projectId]
        );

        this.workshops.set(projectId, {
          projectId,
          projectName: evaluatorInfo.project_name,
          participants: new Map(),
          adminId: projectQuery.rows[0]?.created_by,
          startTime: new Date(),
          status: 'waiting'
        });
      }

      const workshop = this.workshops.get(projectId)!;
      
      // 룸 참가
      socket.join(`workshop-${projectId}`);
      
      // 참가자 정보 추가
      const participant: WorkshopParticipant = {
        socketId: socket.id,
        userId: evaluatorInfo.evaluator_id,
        evaluatorCode: evaluatorInfo.evaluator_code,
        evaluatorName: evaluatorInfo.evaluator_name,
        isActive: true,
        lastSeen: new Date()
      };

      workshop.participants.set(socket.id, participant);
      socket.currentWorkshop = projectId;

      // 참가 알림
      socket.emit('workshop-joined', {
        projectId,
        projectName: workshop.projectName,
        participantCount: workshop.participants.size,
        status: workshop.status,
        isAdmin: evaluatorInfo.evaluator_id === workshop.adminId
      });

      // 다른 참가자들에게 알림
      socket.to(`workshop-${projectId}`).emit('participant-joined', {
        participant: {
          evaluatorCode: participant.evaluatorCode,
          evaluatorName: participant.evaluatorName,
          isAdmin: evaluatorInfo.evaluator_id === workshop.adminId
        }
      });

      // 현재 참가자 목록 전송
      this.broadcastParticipantList(projectId);

      console.log(`User ${participant.evaluatorName} joined workshop ${projectId}`);

    } catch (error) {
      console.error('Error joining workshop:', error);
      socket.emit('workshop-error', { message: '워크숍 참가에 실패했습니다.' });
    }
  }

  private handleLeaveWorkshop(socket: any, data: { projectId: string }) {
    const { projectId } = data;
    this.removeParticipant(socket, projectId);
  }

  private async handleProgressUpdate(socket: any, data: { 
    projectId: string; 
    taskType: string; 
    progress: number; 
    details?: any 
  }) {
    try {
      const workshop = this.workshops.get(data.projectId);
      if (!workshop) return;

      const participant = workshop.participants.get(socket.id);
      if (!participant) return;

      // 진행상황 데이터베이스 업데이트
      await query(
        `UPDATE evaluator_progress 
         SET completion_rate = $1, last_activity = CURRENT_TIMESTAMP
         WHERE project_id = $2 AND evaluator_id = $3`,
        [data.progress, data.projectId, participant.userId]
      );

      // 실시간 진행상황 브로드캐스트
      socket.to(`workshop-${data.projectId}`).emit('progress-updated', {
        evaluatorCode: participant.evaluatorCode,
        evaluatorName: participant.evaluatorName,
        taskType: data.taskType,
        progress: data.progress,
        timestamp: new Date().toISOString(),
        details: data.details
      });

      console.log(`Progress update from ${participant.evaluatorName}: ${data.progress}%`);

    } catch (error) {
      console.error('Error handling progress update:', error);
    }
  }

  private async handleEvaluationUpdate(socket: any, data: {
    projectId: string;
    evaluationType: 'pairwise' | 'direct';
    target: string;
    value: any;
    isComplete: boolean;
  }) {
    try {
      const workshop = this.workshops.get(data.projectId);
      if (!workshop) return;

      const participant = workshop.participants.get(socket.id);
      if (!participant) return;

      // 실시간 평가 진행상황 공유
      socket.to(`workshop-${data.projectId}`).emit('evaluation-progress', {
        evaluatorCode: participant.evaluatorCode,
        evaluatorName: participant.evaluatorName,
        evaluationType: data.evaluationType,
        target: data.target,
        isComplete: data.isComplete,
        timestamp: new Date().toISOString()
      });

      // 완료된 평가의 경우 전체 진행률 업데이트
      if (data.isComplete) {
        const progressQuery = await query(
          `SELECT 
             COUNT(*) FILTER (WHERE is_completed = true) as completed_count,
             COUNT(*) as total_count
           FROM evaluator_progress 
           WHERE project_id = $1`,
          [data.projectId]
        );

        const progress = progressQuery.rows[0];
        const completionRate = progress.total_count > 0 
          ? (progress.completed_count / progress.total_count) * 100 
          : 0;

        this.io.to(`workshop-${data.projectId}`).emit('overall-progress', {
          completionRate,
          completedEvaluators: progress.completed_count,
          totalEvaluators: progress.total_count
        });
      }

    } catch (error) {
      console.error('Error handling evaluation update:', error);
    }
  }

  private async handleConsistencyCheck(socket: any, data: {
    projectId: string;
    matrixKey: string;
    consistencyRatio: number;
    status: 'pass' | 'fail';
    suggestions?: any[];
  }) {
    try {
      const workshop = this.workshops.get(data.projectId);
      if (!workshop) return;

      const participant = workshop.participants.get(socket.id);
      if (!participant) return;

      // 일관성 체크 결과 공유
      socket.to(`workshop-${data.projectId}`).emit('consistency-result', {
        evaluatorCode: participant.evaluatorCode,
        evaluatorName: participant.evaluatorName,
        matrixKey: data.matrixKey,
        consistencyRatio: data.consistencyRatio,
        status: data.status,
        suggestions: data.suggestions,
        timestamp: new Date().toISOString()
      });

      // 일관성 문제 발생 시 관리자에게 특별 알림
      if (data.status === 'fail') {
        const adminSockets = Array.from(workshop.participants.values())
          .filter(p => p.userId === workshop.adminId)
          .map(p => p.socketId);

        adminSockets.forEach(adminSocketId => {
          this.io.to(adminSocketId).emit('admin-alert', {
            type: 'consistency_issue',
            evaluatorCode: participant.evaluatorCode,
            evaluatorName: participant.evaluatorName,
            consistencyRatio: data.consistencyRatio,
            matrixKey: data.matrixKey
          });
        });
      }

    } catch (error) {
      console.error('Error handling consistency check:', error);
    }
  }

  private async handleAdminCommand(socket: any, data: {
    projectId: string;
    command: string;
    target?: string;
    payload?: any;
  }) {
    try {
      const workshop = this.workshops.get(data.projectId);
      if (!workshop) return;

      const participant = workshop.participants.get(socket.id);
      if (!participant || participant.userId !== workshop.adminId) {
        socket.emit('admin-error', { message: '관리자 권한이 필요합니다.' });
        return;
      }

      switch (data.command) {
        case 'start_workshop':
          workshop.status = 'active';
          this.io.to(`workshop-${data.projectId}`).emit('workshop-started', {
            message: '워크숍이 시작되었습니다.',
            timestamp: new Date().toISOString()
          });
          break;

        case 'pause_workshop':
          workshop.status = 'paused';
          this.io.to(`workshop-${data.projectId}`).emit('workshop-paused', {
            message: '워크숍이 일시 중지되었습니다.',
            timestamp: new Date().toISOString()
          });
          break;

        case 'end_workshop':
          workshop.status = 'completed';
          this.io.to(`workshop-${data.projectId}`).emit('workshop-ended', {
            message: '워크숍이 종료되었습니다.',
            timestamp: new Date().toISOString()
          });
          break;

        case 'broadcast_message':
          this.io.to(`workshop-${data.projectId}`).emit('admin-message', {
            message: data.payload.message,
            timestamp: new Date().toISOString()
          });
          break;

        case 'request_status':
          this.io.to(`workshop-${data.projectId}`).emit('status-request', {
            message: '현재 진행상황을 보고해 주세요.',
            timestamp: new Date().toISOString()
          });
          break;

        default:
          socket.emit('admin-error', { message: '알 수 없는 명령입니다.' });
      }

    } catch (error) {
      console.error('Error handling admin command:', error);
      socket.emit('admin-error', { message: '관리자 명령 처리에 실패했습니다.' });
    }
  }

  private handleDisconnect(socket: any) {
    console.log(`Workshop client disconnected: ${socket.id}`);
    
    if (socket.currentWorkshop) {
      this.removeParticipant(socket, socket.currentWorkshop);
    }
  }

  private removeParticipant(socket: any, projectId: string) {
    const workshop = this.workshops.get(projectId);
    if (!workshop) return;

    const participant = workshop.participants.get(socket.id);
    if (!participant) return;

    workshop.participants.delete(socket.id);
    socket.leave(`workshop-${projectId}`);

    // 퇴장 알림
    socket.to(`workshop-${projectId}`).emit('participant-left', {
      evaluatorCode: participant.evaluatorCode,
      evaluatorName: participant.evaluatorName
    });

    // 참가자가 없으면 워크숍 정리
    if (workshop.participants.size === 0) {
      this.workshops.delete(projectId);
      console.log(`Workshop ${projectId} cleaned up - no participants`);
    } else {
      this.broadcastParticipantList(projectId);
    }

    console.log(`User ${participant.evaluatorName} left workshop ${projectId}`);
  }

  private broadcastParticipantList(projectId: string) {
    const workshop = this.workshops.get(projectId);
    if (!workshop) return;

    const participantList = Array.from(workshop.participants.values()).map(p => ({
      evaluatorCode: p.evaluatorCode,
      evaluatorName: p.evaluatorName,
      isActive: p.isActive,
      isAdmin: p.userId === workshop.adminId,
      lastSeen: p.lastSeen
    }));

    this.io.to(`workshop-${projectId}`).emit('participants-updated', {
      participants: participantList,
      totalCount: participantList.length
    });
  }

  // 공개 메서드들
  public getWorkshopInfo(projectId: string) {
    const workshop = this.workshops.get(projectId);
    if (!workshop) return null;

    return {
      projectId: workshop.projectId,
      projectName: workshop.projectName,
      participantCount: workshop.participants.size,
      status: workshop.status,
      startTime: workshop.startTime
    };
  }

  public getAllWorkshops() {
    const workshops = Array.from(this.workshops.values()).map(w => ({
      projectId: w.projectId,
      projectName: w.projectName,
      participantCount: w.participants.size,
      status: w.status,
      startTime: w.startTime
    }));

    return workshops;
  }
}

export default WorkshopSyncService;