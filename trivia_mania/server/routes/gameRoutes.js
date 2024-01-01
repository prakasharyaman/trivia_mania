## server/routes/gameRoutes.js
const express = require('express');
const gameController = require('../controllers/gameController');

// Create a new router object
const router = express.Router();

// Route to start a new game
router.post('/start', (req, res) => {
  gameController.startNewGame(req, res);
});

// Route to get a question
router.get('/question', (req, res) => {
  gameController.getQuestion(req, res);
});

// Route to update a player's score
router.post('/score', (req, res) => {
  gameController.updateScore(req, res);
});

module.exports = router;
