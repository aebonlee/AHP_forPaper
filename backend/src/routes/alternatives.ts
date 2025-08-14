import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

// Get all alternatives for a project
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

    const alternativesResult = await query(
      'SELECT * FROM alternatives WHERE project_id = $1 ORDER BY order_index, name',
      [projectId]
    );

    res.json({ alternatives: alternativesResult.rows });
  } catch (error) {
    console.error('Alternatives fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});

// Create a new alternative
router.post('/',
  authenticateToken,
  [
    body('project_id').isUUID().withMessage('Valid project ID is required'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
    body('description').optional().isLength({ max: 1000 }),
    body('order_index').isInt({ min: 1 }).withMessage('Order index must be positive')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { project_id, name, description, order_index } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // Check project access (only admins can create alternatives)
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only project admins can create alternatives' });
      }

      const accessResult = await query(
        'SELECT id FROM projects WHERE id = $1 AND admin_id = $2',
        [project_id, userId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const result = await query(
        `INSERT INTO alternatives (project_id, name, description, order_index)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [project_id, name, description || null, order_index]
      );

      res.status(201).json({ alternative: result.rows[0] });
    } catch (error) {
      console.error('Alternative creation error:', error);
      res.status(500).json({ error: 'Failed to create alternative' });
    }
  }
);

// Update an alternative
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
        `SELECT a.* FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = $1 AND p.admin_id = $2`,
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found or access denied' });
      }

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates)];

      const result = await query(
        `UPDATE alternatives SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        values
      );

      res.json({ alternative: result.rows[0] });
    } catch (error) {
      console.error('Alternative update error:', error);
      res.status(500).json({ error: 'Failed to update alternative' });
    }
  }
);

// Delete an alternative
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Check access
    const checkResult = await query(
      `SELECT a.*, p.admin_id FROM alternatives a
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Alternative not found' });
    }

    if (checkResult.rows[0].admin_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM alternatives WHERE id = $1', [id]);

    res.json({ message: 'Alternative deleted successfully' });
  } catch (error) {
    console.error('Alternative deletion error:', error);
    res.status(500).json({ error: 'Failed to delete alternative' });
  }
});

export default router;