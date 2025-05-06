const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, pharmId, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, pharmId, password) VALUES (?, ?, ?, ?)',
      [name, email, pharmId, hashedPassword]
    );
    return result.insertId;
  }
}

module.exports = User;