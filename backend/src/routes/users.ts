import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import pool from '../database/connection';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/users',
  authenticateToken,
  requireRole(['admin']),
  [
    query('role').optional().isIn(['admin', 'evaluator']).withMessage('Role must be either admin or evaluator'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const { role, search } = req.query;

      let query = `
        SELECT id, first_name, last_name, email, role, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const queryParams: any[] = [];
      let paramCounter = 1;

      if (role) {
        query += ` AND role = $${paramCounter}`;
        queryParams.push(role);
        paramCounter++;
      }

      if (search) {
        query += ` AND (
          first_name ILIKE $${paramCounter} OR 
          last_name ILIKE $${paramCounter} OR 
          email ILIKE $${paramCounter}
        )`;
        queryParams.push(`%${search}%`);
        paramCounter++;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, queryParams);

      res.json({
        users: result.rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/users/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const userId = req.params.id;
      const requesterId = req.user.id;
      const requesterRole = req.user.role;

      if (requesterRole !== 'admin' && userId !== requesterId) {
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
      }

      const result = await pool.query(
        `SELECT id, first_name, last_name, email, role, created_at, updated_at
         FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];

      if (requesterRole === 'admin' || userId === requesterId) {
        const projectsResult = await pool.query(
          `SELECT 
             COUNT(CASE WHEN created_by = $1 THEN 1 END) as created_projects,
             COUNT(CASE WHEN pe.evaluator_id = $1 THEN 1 END) as assigned_projects
           FROM projects p
           LEFT JOIN project_evaluators pe ON p.id = pe.project_id
           WHERE p.created_by = $1 OR pe.evaluator_id = $1`,
          [userId]
        );

        const stats = projectsResult.rows[0];

        res.json({
          user: {
            ...user,
            statistics: {
              created_projects: parseInt(stats.created_projects || 0),
              assigned_projects: parseInt(stats.assigned_projects || 0)
            }
          }
        });
      } else {
        res.json({ user });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/users',
  authenticateToken,
  requireRole(['admin']),
  [
    body('first_name').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be less than 100 characters'),
    body('last_name').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be less than 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
    body('role').isIn(['admin', 'evaluator']).withMessage('Role must be either admin or evaluator')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { first_name, last_name, email, password, role } = req.body;

      const existingUserResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, first_name, last_name, email, role, created_at`,
        [first_name, last_name, email, hashedPassword, role]
      );

      const user = result.rows[0];

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/users/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('first_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be less than 100 characters'),
    body('last_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be less than 100 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'evaluator']).withMessage('Role must be either admin or evaluator')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = req.params.id;
      const requesterId = req.user.id;
      const requesterRole = req.user.role;
      const { first_name, last_name, email, role } = req.body;

      const targetUserResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (targetUserResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetUser = targetUserResult.rows[0];

      const canUpdateProfile = (userId === requesterId);
      const canUpdateRole = (requesterRole === 'admin');

      if (!canUpdateProfile && !canUpdateRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (role && role !== targetUser.role && !canUpdateRole) {
        return res.status(403).json({ error: 'Only admins can change user roles' });
      }

      if (email && email !== targetUser.email) {
        const existingUserResult = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );

        if (existingUserResult.rows.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      const fieldsToUpdate: string[] = [];
      const queryParams: any[] = [];
      let paramCounter = 1;

      if (first_name !== undefined) {
        fieldsToUpdate.push(`first_name = $${paramCounter}`);
        queryParams.push(first_name);
        paramCounter++;
      }

      if (last_name !== undefined) {
        fieldsToUpdate.push(`last_name = $${paramCounter}`);
        queryParams.push(last_name);
        paramCounter++;
      }

      if (email !== undefined) {
        fieldsToUpdate.push(`email = $${paramCounter}`);
        queryParams.push(email);
        paramCounter++;
      }

      if (role !== undefined && canUpdateRole) {
        fieldsToUpdate.push(`role = $${paramCounter}`);
        queryParams.push(role);
        paramCounter++;
      }

      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      fieldsToUpdate.push('updated_at = NOW()');
      queryParams.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, first_name, last_name, email, role, updated_at
      `;

      const result = await pool.query(updateQuery, queryParams);
      const updatedUser = result.rows[0];

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/users/:id/password',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('current_password').isLength({ min: 1 }).withMessage('Current password is required'),
    body('new_password').isLength({ min: 6, max: 128 }).withMessage('New password must be between 6 and 128 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const userId = req.params.id;
      const requesterId = req.user.id;
      const requesterRole = req.user.role;
      const { current_password, new_password } = req.body;

      if (requesterRole !== 'admin' && userId !== requesterId) {
        return res.status(403).json({ error: 'Access denied. You can only change your own password.' });
      }

      const userResult = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      if (userId === requesterId) {
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);

      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/users/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const userId = req.params.id;
      const requesterId = req.user.id;

      if (userId === requesterId) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
      }

      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const projectsResult = await pool.query(
        'SELECT COUNT(*) as count FROM projects WHERE created_by = $1',
        [userId]
      );

      const projectCount = parseInt(projectsResult.rows[0].count);

      if (projectCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete user. User has ${projectCount} project(s). Transfer or delete projects first.` 
        });
      }

      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/evaluators',
  authenticateToken,
  [
    query('project_id').optional().isUUID().withMessage('Invalid project ID format'),
    query('available_only').optional().isBoolean().withMessage('Available only must be boolean')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const { project_id, available_only } = req.query;

      let query = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.created_at
        FROM users u
        WHERE u.role = 'evaluator'
      `;
      const queryParams: any[] = [];
      let paramCounter = 1;

      if (project_id && available_only === 'true') {
        query += ` AND u.id NOT IN (
          SELECT pe.evaluator_id 
          FROM project_evaluators pe 
          WHERE pe.project_id = $${paramCounter}
        )`;
        queryParams.push(project_id);
        paramCounter++;
      }

      query += ` ORDER BY u.first_name, u.last_name`;

      const result = await pool.query(query, queryParams);

      if (project_id && available_only !== 'true') {
        const assignedResult = await pool.query(
          `SELECT pe.evaluator_id, pe.status, pe.created_at as assigned_at
           FROM project_evaluators pe
           WHERE pe.project_id = $1`,
          [project_id]
        );

        const assignedEvaluators = assignedResult.rows.reduce((acc: any, row: any) => {
          acc[row.evaluator_id] = {
            status: row.status,
            assigned_at: row.assigned_at
          };
          return acc;
        }, {} as Record<string, any>);

        const evaluatorsWithStatus = result.rows.map((evaluator: any) => ({
          ...evaluator,
          assignment_status: assignedEvaluators[evaluator.id]?.status || null,
          assigned_at: assignedEvaluators[evaluator.id]?.assigned_at || null,
          is_assigned: !!assignedEvaluators[evaluator.id]
        }));

        return res.json({ evaluators: evaluatorsWithStatus });
      }

      res.json({ evaluators: result.rows });
    } catch (error) {
      console.error('Get evaluators error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;