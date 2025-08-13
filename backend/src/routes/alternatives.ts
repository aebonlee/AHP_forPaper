import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/alternatives',
  authenticateToken,
  [
    body('project_id').isUUID().withMessage('Invalid project ID format'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { project_id, name, description } = req.body;
      const userId = req.user.id;

      const projectResult = await pool.query(
        `SELECT created_by FROM projects WHERE id = $1`,
        [project_id]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = projectResult.rows[0];
      const userRole = req.user.role;

      if (userRole !== 'admin' && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can add alternatives.' });
      }

      const result = await pool.query(
        `INSERT INTO alternatives (project_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [project_id, name, description || null]
      );

      const alternative = result.rows[0];

      res.status(201).json({
        message: 'Alternative created successfully',
        alternative: {
          id: alternative.id,
          project_id: alternative.project_id,
          name: alternative.name,
          description: alternative.description,
          created_at: alternative.created_at
        }
      });
    } catch (error) {
      console.error('Create alternative error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects/:project_id/alternatives',
  authenticateToken,
  [
    param('project_id').isUUID().withMessage('Invalid project ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.project_id;
      const userId = req.user.id;
      const userRole = req.user.role;

      let accessQuery = `
        SELECT p.created_by 
        FROM projects p
        WHERE p.id = $1
      `;
      
      if (userRole === 'evaluator') {
        accessQuery += ` AND (p.created_by = $2 OR EXISTS(
          SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $1 AND pe.evaluator_id = $2
        ))`;
      }

      const accessParams = userRole === 'evaluator' ? [projectId, userId] : [projectId];
      const accessResult = await pool.query(accessQuery, accessParams);

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const alternativesResult = await pool.query(
        `SELECT * FROM alternatives WHERE project_id = $1 ORDER BY created_at`,
        [projectId]
      );

      res.json({
        alternatives: alternativesResult.rows
      });
    } catch (error) {
      console.error('Get alternatives error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/alternatives/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid alternative ID format'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const alternativeId = req.params.id;
      const { name, description } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const alternativeResult = await pool.query(
        `SELECT a.*, p.created_by 
         FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = $1`,
        [alternativeId]
      );

      if (alternativeResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found' });
      }

      const alternative = alternativeResult.rows[0];

      if (userRole !== 'admin' && alternative.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can update alternatives.' });
      }

      const updateResult = await pool.query(
        `UPDATE alternatives 
         SET name = $1, description = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [name, description || null, alternativeId]
      );

      const updatedAlternative = updateResult.rows[0];

      res.json({
        message: 'Alternative updated successfully',
        alternative: {
          id: updatedAlternative.id,
          project_id: updatedAlternative.project_id,
          name: updatedAlternative.name,
          description: updatedAlternative.description,
          updated_at: updatedAlternative.updated_at
        }
      });
    } catch (error) {
      console.error('Update alternative error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/alternatives/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid alternative ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const alternativeId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const alternativeResult = await pool.query(
        `SELECT a.*, p.created_by 
         FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = $1`,
        [alternativeId]
      );

      if (alternativeResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found' });
      }

      const alternative = alternativeResult.rows[0];

      if (userRole !== 'admin' && alternative.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can delete alternatives.' });
      }

      await pool.query('DELETE FROM alternatives WHERE id = $1', [alternativeId]);

      res.json({ message: 'Alternative deleted successfully' });
    } catch (error) {
      console.error('Delete alternative error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;