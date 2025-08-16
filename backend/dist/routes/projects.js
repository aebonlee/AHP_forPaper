"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }),
    (0, express_validator_1.body)('objective').optional().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, objective } = req.body;
        const userId = req.user.id;
        const result = await (0, connection_1.query)(`INSERT INTO projects (title, name, description, objective, admin_id, status)
         VALUES ($1, $1, $2, $3, $4, 'draft')
         RETURNING *`, [title, description || null, objective || null, userId]);
        res.status(201).json({ project: result.rows[0] });
    }
    catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let queryText = `
      SELECT p.*, 
             COUNT(DISTINCT pe.evaluator_id) as evaluator_count,
             u.first_name || ' ' || u.last_name as admin_name
      FROM projects p
      LEFT JOIN project_evaluators pe ON p.id = pe.project_id
      LEFT JOIN users u ON p.admin_id = u.id
    `;
        let params = [];
        // Filter out old sample projects
        let whereConditions = [`p.title NOT IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')`];
        if (userRole === 'evaluator') {
            whereConditions.push(`(p.admin_id = $1 OR pe.evaluator_id = $1)`);
            params = [userId];
        }
        else {
            whereConditions.push(`p.admin_id = $1`);
            params = [userId];
        }
        queryText += ` WHERE ` + whereConditions.join(' AND ');
        queryText += ` GROUP BY p.id, u.first_name, u.last_name ORDER BY p.created_at DESC`;
        const result = await (0, connection_1.query)(queryText, params);
        res.json({ projects: result.rows });
    }
    catch (error) {
        console.error('Projects fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        let queryText = `
      SELECT p.*, u.first_name || ' ' || u.last_name as admin_name
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      WHERE p.id = $1 AND p.title NOT IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
    `;
        let params = [id];
        if (userRole === 'evaluator') {
            queryText += ` AND (p.admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = p.id AND pe.evaluator_id = $2
      ))`;
            params.push(userId);
        }
        else {
            queryText += ` AND p.admin_id = $2`;
            params.push(userId);
        }
        const result = await (0, connection_1.query)(queryText, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ project: result.rows[0] });
    }
    catch (error) {
        console.error('Project fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }),
    (0, express_validator_1.body)('objective').optional().isLength({ max: 500 }),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'active', 'completed'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;
        const checkResult = await (0, connection_1.query)('SELECT * FROM projects WHERE id = $1 AND admin_id = $2', [id, userId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found or access denied' });
        }
        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 3}`)
            .join(', ');
        const values = [id, userId, ...Object.values(updates)];
        const result = await (0, connection_1.query)(`UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND admin_id = $2
         RETURNING *`, values);
        res.json({ project: result.rows[0] });
    }
    catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await (0, connection_1.query)('DELETE FROM projects WHERE id = $1 AND admin_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found or access denied' });
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Project deletion error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
exports.default = router;
