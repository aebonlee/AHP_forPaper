import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/criteria',
  authenticateToken,
  [
    body('project_id').isUUID().withMessage('Invalid project ID format'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('parent_id').optional().isUUID().withMessage('Invalid parent ID format'),
    body('weight').optional().isFloat({ min: 0, max: 1 }).withMessage('Weight must be between 0 and 1')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { project_id, name, description, parent_id, weight } = req.body;
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
        return res.status(403).json({ error: 'Access denied. Only project creators can add criteria.' });
      }

      if (parent_id) {
        const parentResult = await pool.query(
          `SELECT level FROM criteria WHERE id = $1 AND project_id = $2`,
          [parent_id, project_id]
        );

        if (parentResult.rows.length === 0) {
          return res.status(400).json({ error: 'Parent criterion not found in this project' });
        }

        const parentLevel = parentResult.rows[0].level;
        if (parentLevel >= 4) {
          return res.status(400).json({ error: 'Maximum hierarchy depth (4 levels) exceeded' });
        }
      }

      const level = parent_id ? 
        (await pool.query('SELECT level FROM criteria WHERE id = $1', [parent_id])).rows[0].level + 1 : 1;

      const result = await pool.query(
        `INSERT INTO criteria (project_id, name, description, parent_id, level, weight)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [project_id, name, description || null, parent_id || null, level, weight || 0]
      );

      const criterion = result.rows[0];

      res.status(201).json({
        message: 'Criterion created successfully',
        criterion: {
          id: criterion.id,
          project_id: criterion.project_id,
          name: criterion.name,
          description: criterion.description,
          parent_id: criterion.parent_id,
          level: criterion.level,
          weight: criterion.weight,
          created_at: criterion.created_at
        }
      });
    } catch (error) {
      console.error('Create criterion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects/:project_id/criteria',
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

      const criteriaResult = await pool.query(
        `WITH RECURSIVE criteria_hierarchy AS (
          SELECT c.*, 0 as depth, ARRAY[c.id] as path
          FROM criteria c
          WHERE c.project_id = $1 AND c.parent_id IS NULL
          
          UNION ALL
          
          SELECT c.*, ch.depth + 1, ch.path || c.id
          FROM criteria c
          JOIN criteria_hierarchy ch ON c.parent_id = ch.id
          WHERE NOT c.id = ANY(ch.path)
        )
        SELECT * FROM criteria_hierarchy
        ORDER BY path, name`,
        [projectId]
      );

      res.json({
        criteria: criteriaResult.rows
      });
    } catch (error) {
      console.error('Get criteria error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/criteria/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid criterion ID format'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('weight').optional().isFloat({ min: 0, max: 1 }).withMessage('Weight must be between 0 and 1')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const criterionId = req.params.id;
      const { name, description, weight } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const criterionResult = await pool.query(
        `SELECT c.*, p.created_by 
         FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1`,
        [criterionId]
      );

      if (criterionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found' });
      }

      const criterion = criterionResult.rows[0];

      if (userRole !== 'admin' && criterion.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can update criteria.' });
      }

      const updateResult = await pool.query(
        `UPDATE criteria 
         SET name = $1, description = $2, weight = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, description || null, weight !== undefined ? weight : criterion.weight, criterionId]
      );

      const updatedCriterion = updateResult.rows[0];

      res.json({
        message: 'Criterion updated successfully',
        criterion: {
          id: updatedCriterion.id,
          project_id: updatedCriterion.project_id,
          name: updatedCriterion.name,
          description: updatedCriterion.description,
          parent_id: updatedCriterion.parent_id,
          level: updatedCriterion.level,
          weight: updatedCriterion.weight,
          updated_at: updatedCriterion.updated_at
        }
      });
    } catch (error) {
      console.error('Update criterion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/criteria/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid criterion ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const criterionId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const criterionResult = await pool.query(
        `SELECT c.*, p.created_by 
         FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1`,
        [criterionId]
      );

      if (criterionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found' });
      }

      const criterion = criterionResult.rows[0];

      if (userRole !== 'admin' && criterion.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project creators can delete criteria.' });
      }

      const childrenResult = await pool.query(
        `SELECT COUNT(*) as count FROM criteria WHERE parent_id = $1`,
        [criterionId]
      );

      if (parseInt(childrenResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete criterion with child criteria. Delete child criteria first.' 
        });
      }

      await pool.query('DELETE FROM criteria WHERE id = $1', [criterionId]);

      res.json({ message: 'Criterion deleted successfully' });
    } catch (error) {
      console.error('Delete criterion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;