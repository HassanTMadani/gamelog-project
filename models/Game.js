// models/Game.js
const pool = require('../config/database');

class Game {
  /**
   * Finds a game in our local DB by its RAWG API ID. If it doesn't exist, it creates it.
   * Returns the local database ID of the game.
   */
  static async findOrCreateByApiId(apiGameId, name, backgroundImage, released) {
    try {
      // First, try to find the game
      let [rows] = await pool.query('SELECT id FROM games WHERE api_id = ?', [apiGameId]);
      
      if (rows.length > 0) {
        return rows[0].id; // Game exists, return its local ID
      } else {
        // Game doesn't exist, create it
        const [result] = await pool.query(
          'INSERT INTO games (api_id, name, background_image, released) VALUES (?, ?, ?, ?)',
          [apiGameId, name, backgroundImage, released]
        );
        return result.insertId; // Return the new local ID
      }
    } catch (error) {
      console.error('Error in Game.findOrCreateByApiId:', error);
      throw error;
    }
  }

  /**
   * Saves or updates a user's review for a game.
   * This uses the advanced "ON DUPLICATE KEY UPDATE" clause for efficiency.
   * Make sure have a UNIQUE constraint on (user_id, game_id) in reviews table.
   */
  static async saveReview(userId, localGameId, rating, reviewText) {
    try {
      const sql = `
        INSERT INTO reviews (user_id, game_id, rating, review_text)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text)
      `;
      const [result] = await pool.query(sql, [userId, localGameId, rating, reviewText]);
      return result;
    } catch (error) {
      console.error('Error in Game.saveReview:', error);
      throw error;
    }
  }

  /**
   * Retrieves all games in a specific user's library, including their review
   * and the community average rating.
   */
  static async getUserLibrary(userId, searchTerm = '') {
    try {
      // Note the subquery to calculate the community average rating
      const sql = `
        SELECT 
          r.id as review_id, r.user_id, r.game_id, r.rating, r.review_text,
          g.name, g.background_image,
          (SELECT AVG(rating) FROM reviews WHERE game_id = g.id) AS community_rating
        FROM reviews r
        JOIN games g ON r.game_id = g.id
        WHERE r.user_id = ? AND g.name LIKE ?
        ORDER BY g.name ASC
      `;
      // The '%' are wildcards for the LIKE clause
      const [rows] = await pool.query(sql, [userId, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error('Error in Game.getUserLibrary:', error);
      throw error;
    }
  }
  
  /**
   * Finds a single review by its ID for editing.
   */
  static async findReviewById(reviewId) {
      try {
          const sql = `
              SELECT r.id, r.rating, r.review_text, g.id as game_id, g.name, g.background_image
              FROM reviews r
              JOIN games g on r.game_id = g.id
              WHERE r.id = ?
          `;
          const [rows] = await pool.query(sql, [reviewId]);
          return rows[0];
      } catch (error) {
          console.error('Error in Game.findReviewById:', error);
          throw error;
      }
  }

  /**
   * Deletes a review by its ID.
   */
  static async deleteReview(reviewId) {
    try {
      const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in Game.deleteReview:', error);
      throw error;
    }
  }
}

module.exports = Game;