import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

// Get all pairwise comparisons for a project
router.get('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { criterion_id, evaluator_id } = req.query;
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

    // Build query for comparisons
    let comparisonQuery = `
      SELECT c.*, u.first_name || ' ' || u.last_name as evaluator_name,
             cr1.name as criterion1_name, cr2.name as criterion2_name,
             alt1.name as alternative1_name, alt2.name as alternative2_name
      FROM pairwise_comparisons c
      LEFT JOIN users u ON c.evaluator_id = u.id
      LEFT JOIN criteria cr1 ON c.criterion1_id = cr1.id
      LEFT JOIN criteria cr2 ON c.criterion2_id = cr2.id
      LEFT JOIN alternatives alt1 ON c.alternative1_id = alt1.id
      LEFT JOIN alternatives alt2 ON c.alternative2_id = alt2.id
      WHERE c.project_id = $1
    `;
    let comparisonParams = [projectId];
    let paramIndex = 2;

    if (criterion_id && typeof criterion_id === 'string') {
      comparisonQuery += ` AND c.criterion_id = $${paramIndex}`;
      comparisonParams.push(criterion_id);
      paramIndex++;
    }

    if (evaluator_id && typeof evaluator_id === 'string' && userRole === 'admin') {
      comparisonQuery += ` AND c.evaluator_id = $${paramIndex}`;
      comparisonParams.push(evaluator_id);
      paramIndex++;
    } else if (userRole === 'evaluator') {
      comparisonQuery += ` AND c.evaluator_id = $${paramIndex}`;
      comparisonParams.push(userId);
      paramIndex++;
    }

    comparisonQuery += ' ORDER BY c.created_at DESC';

    const comparisonsResult = await query(comparisonQuery, comparisonParams);

    res.json({ comparisons: comparisonsResult.rows });
  } catch (error) {
    console.error('Comparisons fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

// Create or update a pairwise comparison (improved with matrix_key support)
router.post('/',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Valid project ID is required'),
    body('matrix_key').isString().withMessage('Matrix key is required'),
    body('i_index').isInt({min: 0}).withMessage('i_index must be non-negative integer'),
    body('j_index').isInt({min: 0}).withMessage('j_index must be non-negative integer'),
    body('value').isFloat({ min: 0.111, max: 9 }).withMessage('Comparison value must be between 1/9 and 9'),
    // Legacy support for old format
    body('criterion1_id').optional().isUUID(),
    body('criterion2_id').optional().isUUID(),
    body('alternative1_id').optional().isUUID(),
    body('alternative2_id').optional().isUUID()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        project_id,
        matrix_key,
        i_index,
        j_index,
        value,
        // Legacy fields
        criterion_id,
        criterion1_id,
        criterion2_id,
        alternative1_id,
        alternative2_id
      } = req.body;
      
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // Check project access
      let accessQuery = 'SELECT id FROM projects WHERE id = $1';
      let accessParams = [project_id];

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

      // Support both new matrix_key format and legacy format
      if (matrix_key && i_index !== undefined && j_index !== undefined) {
        // New format with matrix_key
        if (i_index === j_index) {
          return res.status(400).json({ error: 'Diagonal elements must be 1 (cannot compare element with itself)' });
        }
        
        // Ensure we store only upper triangular matrix (i < j)
        const [i, j] = i_index < j_index ? [i_index, j_index] : [j_index, i_index];
        const adjustedValue = i_index < j_index ? value : 1 / value;
        
        // Check if comparison already exists
        const existingComparison = await query(
          `SELECT * FROM pairwise_comparisons 
           WHERE project_id = $1 AND evaluator_id = $2 AND matrix_key = $3 
           AND i_index = $4 AND j_index = $5`,
          [project_id, userId, matrix_key, i, j]
        );

        let result;
        if (existingComparison.rows.length > 0) {
          // Update existing comparison
          result = await query(
            `UPDATE pairwise_comparisons 
             SET value = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [adjustedValue, existingComparison.rows[0].id]
          );
        } else {
          // Create new comparison
          result = await query(
            `INSERT INTO pairwise_comparisons 
             (project_id, evaluator_id, matrix_key, i_index, j_index, value)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [project_id, userId, matrix_key, i, j, adjustedValue]
          );
        }

        return res.status(201).json({ 
          message: 'Pairwise comparison saved successfully',
          comparison: result.rows[0] 
        });
      }
      
      // Legacy format validation (for backward compatibility)
      if (criterion1_id && criterion2_id) {
        if (alternative1_id || alternative2_id) {
          return res.status(400).json({ 
            error: 'Cannot compare both criteria and alternatives in the same comparison' 
          });
        }
      } else if (alternative1_id && alternative2_id) {
        if (criterion1_id || criterion2_id) {
          return res.status(400).json({ 
            error: 'Cannot compare both criteria and alternatives in the same comparison' 
          });
        }
      } else if (!matrix_key) {
        return res.status(400).json({ 
          error: 'Must provide either matrix_key with indices or criterion/alternative pairs for comparison' 
        });
      }

      // Check if comparison already exists and update or create
      let existingComparison;
      if (criterion1_id && criterion2_id) {
        existingComparison = await query(
          `SELECT * FROM pairwise_comparisons 
           WHERE project_id = $1 AND criterion_id = $2 AND evaluator_id = $3
           AND criterion1_id = $4 AND criterion2_id = $5`,
          [project_id, criterion_id, userId, criterion1_id, criterion2_id]
        );
      } else {
        existingComparison = await query(
          `SELECT * FROM pairwise_comparisons 
           WHERE project_id = $1 AND criterion_id = $2 AND evaluator_id = $3
           AND alternative1_id = $4 AND alternative2_id = $5`,
          [project_id, criterion_id, userId, alternative1_id, alternative2_id]
        );
      }

      let result;
      if (existingComparison.rows.length > 0) {
        // Update existing comparison
        result = await query(
          `UPDATE pairwise_comparisons 
           SET value = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
           RETURNING *`,
          [value, existingComparison.rows[0].id]
        );
      } else {
        // Create new comparison
        result = await query(
          `INSERT INTO pairwise_comparisons 
           (project_id, criterion_id, evaluator_id, value, criterion1_id, criterion2_id, alternative1_id, alternative2_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            project_id,
            criterion_id,
            userId,
            value,
            criterion1_id || null,
            criterion2_id || null,
            alternative1_id || null,
            alternative2_id || null
          ]
        );
      }

      res.status(201).json({ comparison: result.rows[0] });
    } catch (error) {
      console.error('Comparison creation error:', error);
      res.status(500).json({ error: 'Failed to create comparison' });
    }
  }
);

// Get comparison matrix for a criterion
router.get('/:projectId/matrix/:criterionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId, criterionId } = req.params;
    const { evaluator_id } = req.query;
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

    // Determine evaluator
    const evaluatorId = evaluator_id && typeof evaluator_id === 'string' && userRole === 'admin' ? evaluator_id : userId;

    // Get all comparisons for this criterion and evaluator
    const comparisonsResult = await query(
      `SELECT * FROM pairwise_comparisons 
       WHERE project_id = $1 AND criterion_id = $2 AND evaluator_id = $3`,
      [projectId, criterionId, evaluatorId]
    );

    // Get elements being compared (either criteria or alternatives)
    let elementsResult;
    if (comparisonsResult.rows.length > 0 && comparisonsResult.rows[0].criterion1_id) {
      // Criteria comparisons
      elementsResult = await query(
        'SELECT id, name FROM criteria WHERE parent_id = $1 ORDER BY order_index',
        [criterionId]
      );
    } else {
      // Alternative comparisons
      elementsResult = await query(
        'SELECT id, name FROM alternatives WHERE project_id = $1 ORDER BY order_index',
        [projectId]
      );
    }

    res.json({ 
      comparisons: comparisonsResult.rows,
      elements: elementsResult.rows,
      criterion_id: criterionId,
      evaluator_id: evaluatorId
    });
  } catch (error) {
    console.error('Comparison matrix fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison matrix' });
  }
});

// Delete a comparison
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // Check access
    let checkQuery = `
      SELECT c.*, p.admin_id FROM pairwise_comparisons c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = $1
    `;
    
    if (userRole === 'evaluator') {
      checkQuery += ` AND c.evaluator_id = $2`;
    }

    const checkResult = await query(
      checkQuery, 
      userRole === 'evaluator' ? [id, userId] : [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    // Evaluators can only delete their own comparisons, admins can delete any
    if (userRole === 'evaluator' || checkResult.rows[0].admin_id === userId) {
      await query('DELETE FROM pairwise_comparisons WHERE id = $1', [id]);
      res.json({ message: 'Comparison deleted successfully' });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Comparison deletion error:', error);
    res.status(500).json({ error: 'Failed to delete comparison' });
  }
});

export default router;