// routes/api.js
const express = require('express');
const Game = require('../models/Game');
const router = express.Router();

// GET /api/user/:userId/library
router.get('/user/:userId/library', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const library = await Game.getUserLibrary(userId);
        if (library.length === 0) {
            return res.status(404).json({ message: 'No library found for this user.' });
        }
        res.status(200).json(library);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;