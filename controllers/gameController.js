// controllers/gameController.js
const axios = require('axios');
const { validationResult } = require('express-validator');
const Game = require('../models/Game');

exports.getHome = (req, res, next) => {
    res.render('index', {
        pageTitle: 'Welcome to GameLog',
        currentPath: '/'
    });
};

exports.getSearch = (req, res, next) => {
    res.render('game/search', {
        pageTitle: 'Search Games',
        currentPath: '/search',
        games: [],
        query: ''
    });
};

exports.postSearch = async (req, res, next) => {
    const searchQuery = req.body.query;
    const apiKey = process.env.RAWG_API_KEY;
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchQuery)}&page_size=12`;

    try {
        const response = await axios.get(url);
        res.render('game/search', {
            pageTitle: 'Search Results',
            currentPath: '/search',
            games: response.data.results,
            query: searchQuery
        });
    } catch (err) {
        console.error('RAWG API Error:', err.message);
        const error = new Error('Could not fetch games from external service.');
        error.httpStatusCode = 503; // Service Unavailable
        return next(error);
    }
};

exports.getLibrary = async (req, res, next) => {
    const userId = req.session.user.id;
    const searchTerm = req.query.search || ''; // For searching within the library
    try {
        const library = await Game.getUserLibrary(userId, searchTerm);
        res.render('game/library', {
            pageTitle: 'My Library',
            currentPath: '/library',
            games: library,
            searchTerm: searchTerm
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getReviewPage = async (req, res, next) => {
    const apiGameId = req.params.apiGameId;
    const apiKey = process.env.RAWG_API_KEY;
    const url = `https://api.rawg.io/api/games/${apiGameId}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const game = response.data;
        res.render('game/review', {
            pageTitle: `Review ${game.name}`,
            currentPath: '/review',
            game: game,
            review: { rating: 3, review_text: '' }, // Default values
            editing: false,
            errorMessage: null,
            validationErrors: []
        });
    } catch (err) {
        const error = new Error('Could not fetch game details.');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postReview = async (req, res, next) => {
    const { apiGameId, name, background_image, released, rating, reviewText, reviewId, gameId } = req.body;
    const userId = req.session.user.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // This part is complex because we need to re-render the page with the error
        // If it was an edit, we fetch review data, otherwise we fetch API data.
        if (reviewId) { // It's an edit
             const review = await Game.findReviewById(reviewId);
             return res.status(422).render('game/review', {
                pageTitle: `Edit Review for ${review.name}`,
                currentPath: '/review',
                game: review,
                review: { id: reviewId, rating: rating, review_text: reviewText },
                editing: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        } else { // It's a new review
            // This is simplified. For a perfect implementation, you'd re-fetch API data.
             return res.status(422).send("Validation failed: " + errors.array()[0].msg);
        }
    }
    
    try {
        // If it's a new review, first find or create the game in our local DB
        const localGameId = reviewId ? gameId : await Game.findOrCreateByApiId(apiGameId, name, background_image, released);
        
        // Now save the review (which will update if it exists)
        await Game.saveReview(userId, localGameId, rating, reviewText);
        
        // FIXED: Redirect to the simple root-relative path
        res.redirect('/library');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getEditReview = async (req, res, next) => {
    const reviewId = req.params.reviewId;
    try {
        const reviewData = await Game.findReviewById(reviewId);
        if (!reviewData) {
            // FIXED: Redirect to the simple root-relative path
            return res.redirect('/library');
        }
        res.render('game/review', {
            pageTitle: `Edit Review for ${reviewData.name}`,
            currentPath: '/review',
            game: reviewData, // contains game info
            review: reviewData, // contains review info
            editing: true,
            errorMessage: null,
            validationErrors: []
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.postDeleteReview = async (req, res, next) => {
    const { reviewId } = req.body;
    try {
        await Game.deleteReview(reviewId);
        // FIXED: Redirect to the simple root-relative path
        res.redirect('/library');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};