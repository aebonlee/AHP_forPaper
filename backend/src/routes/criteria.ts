import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

router.get('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // Check project access
    let accessQuery = 'SELECT id FROM projects WHERE id = $1';
    let accessParams = [projectId];

    if (userRole === 'evaluator') {
      accessQuery += ` AND (admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $1 AND pe.evaluator_id = $2
      ))`;
      accessParams.push(userId);
    } else {
      accessQuery += ' AND admin_id = $2';
      accessParams.push(userId);
    }

    const accessResult = await query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const criteriaResult = await query(
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
      SELECT * FROM criteria_hierarchy ORDER BY path, name`,
      [projectId]
    );

    res.json({ criteria: criteriaResult.rows });
  } catch (error) {
    console.error('Criteria fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch criteria' });
  }
});

router.post('/',
  authenticateToken,
  [
    body('project_id').isUUID().withMessage('Valid project ID is required'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
    body('description').optional().isLength({ max: 1000 }),
    body('parent_id').optional().isUUID(),
    body('level').isInt({ min: 1, max: 4 }).withMessage('Level must be between 1 and 4'),
    body('order_index').isInt({ min: 1 }).withMessage('Order index must be positive')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { project_id, name, description, parent_id, level, order_index } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // Check project access
      let accessQuery = 'SELECT id FROM projects WHERE id = $1';
      let accessParams = [project_id];

      if (userRole === 'admin') {
        accessQuery += ' AND admin_id = $2';
        accessParams.push(userId);
      } else {
        return res.status(403).json({ error: 'Only project admins can create criteria' });
      }

      const accessResult = await query(accessQuery, accessParams);
      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // Validate parent exists if specified
      if (parent_id) {
        const parentResult = await query(
          'SELECT level FROM criteria WHERE id = $1 AND project_id = $2',
          [parent_id, project_id]
        );
        if (parentResult.rows.length === 0) {
          return res.status(404).json({ error: 'Parent criterion not found' });
        }
        if (parentResult.rows[0].level >= 4) {
          return res.status(400).json({ error: 'Cannot create more than 4 levels of criteria' });
        }
      }

      const result = await query(
        `INSERT INTO criteria (project_id, name, description, parent_id, level, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [project_id, name, description || null, parent_id || null, level, order_index]
      );

      res.status(201).json({ criterion: result.rows[0] });
    } catch (error) {
      console.error('Criterion creation error:', error);
      res.status(500).json({ error: 'Failed to create criterion' });
    }
  }
);

router.put('/:id',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isLength({ max: 1000 }),
    body('order_index').optional().isInt({ min: 1 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const updates = req.body;

      // Check access
      const checkResult = await query(
        `SELECT c.* FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1 AND p.admin_id = $2`,
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found or access denied' });
      }

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates)];

      const result = await query(
        `UPDATE criteria SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        values
      );

      res.json({ criterion: result.rows[0] });
    } catch (error) {
      console.error('Criterion update error:', error);
      res.status(500).json({ error: 'Failed to update criterion' });
    }
  }
);

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Check access and get criterion info
    const checkResult = await query(
      `SELECT c.*, p.admin_id FROM criteria c
       JOIN projects p ON c.project_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Criterion not found' });
    }

    if (checkResult.rows[0].admin_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if criterion has children
    const childrenResult = await query(
      'SELECT COUNT(*) as count FROM criteria WHERE parent_id = $1',
      [id]
    );

    if (parseInt(childrenResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete criterion with sub-criteria. Delete sub-criteria first.' 
      });
    }

    await query('DELETE FROM criteria WHERE id = $1', [id]);

    res.json({ message: 'Criterion deleted successfully' });
  } catch (error) {
    console.error('Criterion deletion error:', error);
    res.status(500).json({ error: 'Failed to delete criterion' });
  }
});

export default router;