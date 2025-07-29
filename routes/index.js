// routes/index.js
const express = require('express');
const gameController = require('../controllers/gameController');
const isAuth = require('../middleware/isAuth'); // Import auth middleware
const { body } = require('express-validator');

const router = express.Router();

router.get('/', gameController.getHome);
router.get('/search', isAuth, gameController.getSearch);
router.post('/search', isAuth, gameController.postSearch);
router.get('/library', isAuth, gameController.getLibrary);

router.get('/review/:apiGameId', isAuth, gameController.getReviewPage);
router.post('/review', isAuth, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('reviewText').trim().escape()
], gameController.postReview);

router.get('/edit-review/:reviewId', isAuth, gameController.getEditReview);
router.post('/delete-review', isAuth, gameController.postDeleteReview);

module.exports = router;