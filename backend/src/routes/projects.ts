import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/projects',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('objective').optional().isLength({ max: 500 }).withMessage('Objective must be less than 500 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { title, description, objective } = req.body;
      const userId = req.user.id;

      const result = await pool.query(
        `INSERT INTO projects (title, description, objective, created_by, status)
         VALUES ($1, $2, $3, $4, 'draft')
         RETURNING *`,
        [title, description || null, objective || null, userId]
      );

      const project = result.rows[0];
      res.status(201).json({ 
        message: 'Project created successfully', 
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          objective: project.objective,
          status: project.status,
          created_at: project.created_at
        }
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = `
        SELECT p.*, u.first_name, u.last_name,
               COUNT(pe.id) as evaluator_count,
               COUNT(CASE WHEN pe.status = 'completed' THEN 1 END) as completed_evaluations
        FROM projects p
        JOIN users u ON p.created_by = u.id
        LEFT JOIN project_evaluators pe ON p.id = pe.project_id
      `;
      
      let queryParams: any[] = [];

      if (userRole === 'evaluator') {
        query += ` WHERE p.created_by = $1 OR pe.evaluator_id = $1`;
        queryParams.push(userId);
      } else if (userRole === 'admin') {
        // Admin can see all projects
      }

      query += ` GROUP BY p.id, u.first_name, u.last_name ORDER BY p.created_at DESC`;

      const result = await pool.query(query, queryParams);
      
      res.json({ 
        projects: result.rows.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          objective: row.objective,
          status: row.status,
          created_by: {
            first_name: row.first_name,
            last_name: row.last_name
          },
          evaluator_count: parseInt(row.evaluator_count),
          completed_evaluations: parseInt(row.completed_evaluations),
          created_at: row.created_at,
          updated_at: row.updated_at
        }))
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = `
        SELECT p.*, u.first_name, u.last_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        WHERE p.id = $1
      `;
      let queryParams = [projectId];

      if (userRole === 'evaluator') {
        query += ` AND (p.created_by = $2 OR EXISTS(
          SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $1 AND pe.evaluator_id = $2
        ))`;
        queryParams.push(userId);
      }

      const result = await pool.query(query, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const project = result.rows[0];

      const criteriaResult = await pool.query(
        `SELECT * FROM criteria WHERE project_id = $1 ORDER BY parent_id NULLS FIRST, created_at`,
        [projectId]
      );

      const alternativesResult = await pool.query(
        `SELECT * FROM alternatives WHERE project_id = $1 ORDER BY created_at`,
        [projectId]
      );

      const evaluatorsResult = await pool.query(
        `SELECT pe.*, u.first_name, u.last_name, u.email 
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         WHERE pe.project_id = $1
         ORDER BY pe.created_at`,
        [projectId]
      );

      res.json({
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          objective: project.objective,
          status: project.status,
          created_by: {
            first_name: project.first_name,
            last_name: project.last_name
          },
          created_at: project.created_at,
          updated_at: project.updated_at,
          criteria: criteriaResult.rows,
          alternatives: alternativesResult.rows,
          evaluators: evaluatorsResult.rows
        }
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/projects/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID format'),
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('objective').optional().isLength({ max: 500 }).withMessage('Objective must be less than 500 characters'),
    body('status').optional().isIn(['draft', 'active', 'completed', 'archived']).withMessage('Invalid status')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const projectId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      const { title, description, objective, status } = req.body;

      let checkQuery = `SELECT created_by FROM projects WHERE id = $1`;
      let checkParams = [projectId];

      const checkResult = await pool.query(checkQuery, checkParams);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = checkResult.rows[0];
      
      if (userRole !== 'admin' && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. You can only edit your own projects.' });
      }

      const updateResult = await pool.query(
        `UPDATE projects 
         SET title = $1, description = $2, objective = $3, status = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [title, description || null, objective || null, status || 'draft', projectId]
      );

      const updatedProject = updateResult.rows[0];

      res.json({
        message: 'Project updated successfully',
        project: {
          id: updatedProject.id,
          title: updatedProject.title,
          description: updatedProject.description,
          objective: updatedProject.objective,
          status: updatedProject.status,
          created_at: updatedProject.created_at,
          updated_at: updatedProject.updated_at
        }
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/projects/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const checkResult = await pool.query(
        `SELECT created_by FROM projects WHERE id = $1`,
        [projectId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = checkResult.rows[0];

      if (userRole !== 'admin' && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own projects.' });
      }

      await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/projects/:id/evaluators',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID format'),
    body('evaluator_id').isUUID().withMessage('Invalid evaluator ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const projectId = req.params.id;
      const { evaluator_id } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const projectResult = await pool.query(
        `SELECT created_by FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = projectResult.rows[0];

      if (userRole !== 'admin' && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can add evaluators.' });
      }

      const evaluatorResult = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND role = 'evaluator'`,
        [evaluator_id]
      );

      if (evaluatorResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid evaluator ID' });
      }

      const existingResult = await pool.query(
        `SELECT id FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2`,
        [projectId, evaluator_id]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Evaluator already assigned to this project' });
      }

      await pool.query(
        `INSERT INTO project_evaluators (project_id, evaluator_id, status)
         VALUES ($1, $2, 'pending')`,
        [projectId, evaluator_id]
      );

      res.status(201).json({ message: 'Evaluator added successfully' });
    } catch (error) {
      console.error('Add evaluator error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/projects/:id/evaluators/:evaluator_id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID format'),
    param('evaluator_id').isUUID().withMessage('Invalid evaluator ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.id;
      const evaluatorId = req.params.evaluator_id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const projectResult = await pool.query(
        `SELECT created_by FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = projectResult.rows[0];

      if (userRole !== 'admin' && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can remove evaluators.' });
      }

      const deleteResult = await pool.query(
        `DELETE FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2`,
        [projectId, evaluatorId]
      );

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: 'Evaluator assignment not found' });
      }

      res.json({ message: 'Evaluator removed successfully' });
    } catch (error) {
      console.error('Remove evaluator error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;