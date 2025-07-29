// routes/auth.js
const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/register', authController.getRegister);

router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom(async (value) => {
        const user = await User.findByEmail(value);
        if (user) {
          return Promise.reject('E-mail already in use.');
        }
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.'),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.postRegister
);

module.exports = router;