// models/User.js (REVISED AND IMPROVED)

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// We define the User class as before
class User {
  // The methods remain the same
  static async findByEmail(email) {
    try {
      //prevents SQL injection
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      // Return the first row found, or undefined if no user
      return rows[0];
    } catch (error) {
      console.error('FATAL ERROR in User.findByEmail:', error);
      // re-throw the error so it can be caught by error handler
      throw error;
    }
  }

  static async create(name, email, password) {
    try {
      // Salt and hash the password using 12 rounds of salting
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      const [result] = await pool.query(sql, [name, email, hashedPassword]);
      
      // Return the ID of the newly created user
      return result.insertId;
    } catch (error) {
      console.error('FATAL ERROR in User.create:', error);
      throw error;
    }
  }

  static async verifyPassword(providedPassword, storedHashedPassword) {
    try {
      // bcrypt.compare will securely compare the plain-text password with the hash
      return await bcrypt.compare(providedPassword, storedHashedPassword);
    } catch (error) {
      console.error('FATAL ERROR in User.verifyPassword:', error);
      throw error;
    }
  }
}

// Ensure we are exporting the class itself, which contains the static methods.
module.exports = User;