const db = require('../config/db.config');

class User {
  // Create a new user
  static async create(userData) {
    const sql = 'INSERT INTO users (first_name, last_name, email, password, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    const params = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.password,
      userData.phone || null,
      userData.role || 'user'
    ];
    const [result] = await db.query(sql, params);
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // Update user
  static async update(id, userData) {
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?';
    const params = [userData.first_name, userData.last_name, userData.phone, id];
    const [result] = await db.query(sql, params);
    return result.affectedRows;
  }

  // Get all users with specific role
  static async getAllByRole(role) {
    const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE role = ?', [role]);
    return rows;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = User;
