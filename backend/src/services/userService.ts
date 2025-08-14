import { query } from '../database/connection';
import { User, CreateUserRequest } from '../types';
import { hashPassword } from '../utils/auth';

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const { email, password, first_name, last_name, role } = userData;
    
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, role]
    );
    
    // SQLite에서 새로 생성된 사용자 조회
    const newUser = await query('SELECT * FROM users WHERE id = ?', [result.lastID]);
    return newUser.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    console.log('Finding user by email:', email);
    const result = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    console.log('Query result:', result);
    console.log('Found user:', result.rows[0]);
    
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async getAllUsers(role?: 'admin' | 'evaluator'): Promise<User[]> {
    let queryText = 'SELECT * FROM users';
    let params: any[] = [];
    
    if (role) {
      queryText += ' WHERE role = ?';
      params.push(role);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows;
  }

  static async updateUser(id: string, updates: Partial<Pick<User, 'first_name' | 'last_name' | 'email'>>): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    
    // SQLite에서 업데이트된 사용자 조회
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  }

  static async deleteUser(id: string): Promise<void> {
    const result = await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    if (result.changes === 0) {
      throw new Error('User not found');
    }
  }
}