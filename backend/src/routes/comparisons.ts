import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const SAATY_VALUES = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9];

router.post('/comparisons',
  authenticateToken,
  [
    body('project_id').isUUID().withMessage('Invalid project ID format'),
    body('evaluator_id').isUUID().withMessage('Invalid evaluator ID format'),
    body('item1_id').isUUID().withMessage('Invalid item1 ID format'),
    body('item2_id').isUUID().withMessage('Invalid item2 ID format'),
    body('item_type').isIn(['criteria', 'alternatives']).withMessage('Item type must be either criteria or alternatives'),
    body('value').isFloat().withMessage('Value must be a number')
      .custom((value) => {
        if (!SAATY_VALUES.includes(value)) {
          throw new Error('Value must be a valid Saaty scale value (1/9 to 9)');
        }
        return true;
      }),
    body('criterion_id').optional().isUUID().withMessage('Invalid criterion ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { project_id, evaluator_id, item1_id, item2_id, item_type, value, criterion_id } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (item1_id === item2_id) {
        return res.status(400).json({ error: 'Cannot compare an item with itself' });
      }

      const projectResult = await pool.query(
        `SELECT p.created_by, pe.evaluator_id
         FROM projects p
         LEFT JOIN project_evaluators pe ON p.id = pe.project_id AND pe.evaluator_id = $2
         WHERE p.id = $1`,
        [project_id, evaluator_id]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = projectResult.rows[0];

      if (userRole !== 'admin' && userId !== evaluator_id && project.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. You can only submit your own evaluations.' });
      }

      if (!project.evaluator_id && userRole === 'evaluator') {
        return res.status(403).json({ error: 'You are not assigned as an evaluator for this project.' });
      }

      const existingResult = await pool.query(
        `SELECT id FROM pairwise_comparisons 
         WHERE project_id = $1 AND evaluator_id = $2 
         AND ((item1_id = $3 AND item2_id = $4) OR (item1_id = $4 AND item2_id = $3))
         AND item_type = $5 AND ($6::uuid IS NULL OR criterion_id = $6)`,
        [project_id, evaluator_id, item1_id, item2_id, item_type, criterion_id]
      );

      if (existingResult.rows.length > 0) {
        const updateResult = await pool.query(
          `UPDATE pairwise_comparisons 
           SET value = CASE 
             WHEN item1_id = $3 AND item2_id = $4 THEN $5
             ELSE 1.0 / $5
           END,
           updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [existingResult.rows[0].id, project_id, evaluator_id, item1_id, item2_id, value]
        );

        return res.json({
          message: 'Comparison updated successfully',
          comparison: updateResult.rows[0]
        });
      }

      const result = await pool.query(
        `INSERT INTO pairwise_comparisons (project_id, evaluator_id, item1_id, item2_id, item_type, value, criterion_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [project_id, evaluator_id, item1_id, item2_id, item_type, value, criterion_id || null]
      );

      const reciprocalValue = 1.0 / value;
      await pool.query(
        `INSERT INTO pairwise_comparisons (project_id, evaluator_id, item1_id, item2_id, item_type, value, criterion_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [project_id, evaluator_id, item2_id, item1_id, item_type, reciprocalValue, criterion_id || null]
      );

      res.status(201).json({
        message: 'Comparison saved successfully',
        comparison: result.rows[0]
      });
    } catch (error) {
      console.error('Save comparison error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects/:project_id/comparisons',
  authenticateToken,
  [
    param('project_id').isUUID().withMessage('Invalid project ID format'),
    query('evaluator_id').optional().isUUID().withMessage('Invalid evaluator ID format'),
    query('item_type').optional().isIn(['criteria', 'alternatives']).withMessage('Item type must be either criteria or alternatives'),
    query('criterion_id').optional().isUUID().withMessage('Invalid criterion ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.project_id;
      const { evaluator_id, item_type, criterion_id } = req.query;
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

      let comparisonsQuery = `
        SELECT pc.*, 
               i1.name as item1_name, i2.name as item2_name,
               u.first_name, u.last_name
        FROM pairwise_comparisons pc
        JOIN users u ON pc.evaluator_id = u.id
      `;

      if (item_type === 'criteria') {
        comparisonsQuery += `
          JOIN criteria i1 ON pc.item1_id = i1.id
          JOIN criteria i2 ON pc.item2_id = i2.id
        `;
      } else if (item_type === 'alternatives') {
        comparisonsQuery += `
          JOIN alternatives i1 ON pc.item1_id = i1.id
          JOIN alternatives i2 ON pc.item2_id = i2.id
        `;
      } else {
        comparisonsQuery += `
          LEFT JOIN criteria c1 ON pc.item1_id = c1.id AND pc.item_type = 'criteria'
          LEFT JOIN criteria c2 ON pc.item2_id = c2.id AND pc.item_type = 'criteria'
          LEFT JOIN alternatives a1 ON pc.item1_id = a1.id AND pc.item_type = 'alternatives'
          LEFT JOIN alternatives a2 ON pc.item2_id = a2.id AND pc.item_type = 'alternatives'
        `;
      }

      comparisonsQuery += ` WHERE pc.project_id = $1`;
      const queryParams = [projectId];
      let paramCounter = 2;

      if (evaluator_id) {
        comparisonsQuery += ` AND pc.evaluator_id = $${paramCounter}`;
        queryParams.push(evaluator_id as string);
        paramCounter++;
      }

      if (item_type) {
        comparisonsQuery += ` AND pc.item_type = $${paramCounter}`;
        queryParams.push(item_type as string);
        paramCounter++;
      }

      if (criterion_id) {
        comparisonsQuery += ` AND pc.criterion_id = $${paramCounter}`;
        queryParams.push(criterion_id as string);
        paramCounter++;
      }

      comparisonsQuery += ` ORDER BY pc.created_at DESC`;

      const comparisonsResult = await pool.query(comparisonsQuery, queryParams);

      res.json({
        comparisons: comparisonsResult.rows.map((row: any) => ({
          id: row.id,
          project_id: row.project_id,
          evaluator: {
            id: row.evaluator_id,
            first_name: row.first_name,
            last_name: row.last_name
          },
          item1: {
            id: row.item1_id,
            name: row.item1_name
          },
          item2: {
            id: row.item2_id,
            name: row.item2_name
          },
          item_type: row.item_type,
          value: row.value,
          criterion_id: row.criterion_id,
          created_at: row.created_at,
          updated_at: row.updated_at
        }))
      });
    } catch (error) {
      console.error('Get comparisons error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/projects/:project_id/comparison-matrix',
  authenticateToken,
  [
    param('project_id').isUUID().withMessage('Invalid project ID format'),
    query('evaluator_id').isUUID().withMessage('Evaluator ID is required'),
    query('item_type').isIn(['criteria', 'alternatives']).withMessage('Item type must be either criteria or alternatives'),
    query('criterion_id').optional().isUUID().withMessage('Invalid criterion ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const projectId = req.params.project_id;
      const { evaluator_id, item_type, criterion_id } = req.query;
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

      let itemsQuery: string;
      if (item_type === 'criteria') {
        itemsQuery = criterion_id 
          ? `SELECT * FROM criteria WHERE project_id = $1 AND parent_id = $2 ORDER BY name`
          : `SELECT * FROM criteria WHERE project_id = $1 AND parent_id IS NULL ORDER BY name`;
      } else {
        itemsQuery = `SELECT * FROM alternatives WHERE project_id = $1 ORDER BY name`;
      }

      const itemsParams = criterion_id ? [projectId, criterion_id] : [projectId];
      const itemsResult = await pool.query(itemsQuery, itemsParams);
      const items = itemsResult.rows;

      const comparisonsQuery = `
        SELECT item1_id, item2_id, value
        FROM pairwise_comparisons
        WHERE project_id = $1 AND evaluator_id = $2 AND item_type = $3
        ${criterion_id ? 'AND criterion_id = $4' : 'AND criterion_id IS NULL'}
      `;
      
      const comparisonsParams = criterion_id 
        ? [projectId, evaluator_id, item_type, criterion_id]
        : [projectId, evaluator_id as string, item_type as string];
      
      const comparisonsResult = await pool.query(comparisonsQuery, comparisonsParams);
      const comparisons = comparisonsResult.rows;

      const matrix: number[][] = [];
      for (let i = 0; i < items.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < items.length; j++) {
          if (i === j) {
            matrix[i][j] = 1;
          } else {
            const comparison = comparisons.find(
              (c: any) => c.item1_id === items[i].id && c.item2_id === items[j].id
            );
            matrix[i][j] = comparison ? comparison.value : null;
          }
        }
      }

      res.json({
        items: items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description
        })),
        matrix,
        item_type,
        criterion_id: criterion_id || null,
        evaluator_id
      });
    } catch (error) {
      console.error('Get comparison matrix error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/comparisons/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid comparison ID format')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
      }

      const comparisonId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const comparisonResult = await pool.query(
        `SELECT pc.*, p.created_by
         FROM pairwise_comparisons pc
         JOIN projects p ON pc.project_id = p.id
         WHERE pc.id = $1`,
        [comparisonId]
      );

      if (comparisonResult.rows.length === 0) {
        return res.status(404).json({ error: 'Comparison not found' });
      }

      const comparison = comparisonResult.rows[0];

      if (userRole !== 'admin' && comparison.evaluator_id !== userId && comparison.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own comparisons.' });
      }

      await pool.query(
        `DELETE FROM pairwise_comparisons 
         WHERE (id = $1) OR 
         (project_id = $2 AND evaluator_id = $3 AND item1_id = $5 AND item2_id = $4 AND item_type = $6)`,
        [comparisonId, comparison.project_id, comparison.evaluator_id, 
         comparison.item1_id, comparison.item2_id, comparison.item_type]
      );

      res.json({ message: 'Comparison deleted successfully' });
    } catch (error) {
      console.error('Delete comparison error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;