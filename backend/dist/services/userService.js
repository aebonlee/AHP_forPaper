"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const connection_1 = require("../database/connection");
const auth_1 = require("../utils/auth");
class UserService {
    static async createUser(userData) {
        const { email, password, first_name, last_name, role } = userData;
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const password_hash = await (0, auth_1.hashPassword)(password);
        const result = await (0, connection_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [email, password_hash, first_name, last_name, role]);
        return result.rows[0];
    }
    static async findByEmail(email) {
        const result = await (0, connection_1.query)('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
        return result.rows[0] || null;
    }
    static async findById(id) {
        const result = await (0, connection_1.query)('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
        return result.rows[0] || null;
    }
    static async getAllUsers(role) {
        let queryText = 'SELECT * FROM users WHERE is_active = true';
        let params = [];
        if (role) {
            queryText += ' AND role = $1';
            params.push(role);
        }
        queryText += ' ORDER BY created_at DESC';
        const result = await (0, connection_1.query)(queryText, params);
        return result.rows;
    }
    static async updateUser(id, updates) {
        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [id, ...Object.values(updates)];
        const result = await (0, connection_1.query)(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`, values);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    }
    static async deleteUser(id) {
        const result = await (0, connection_1.query)('UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
    }
}
exports.UserService = UserService;
