const Question = require('../models/Question');
const GameSession = require('../models/GameSession');

class GameController {
  // Error handling method
  handleError(res, err, message, statusCode = 500) {
    console.error(message, err);
    res.status(statusCode).json({ error: message });
  }

  // Generates a unique session ID for a new game session
  generateSessionID() {
    return 'sess_' + Math.random().toString(36).substr(2, 9);
  }

  // Starts a new game and returns a new session ID
  async startNewGame(req, res) {
    try {
      const newGameSession = new GameSession({
        sessionID: this.generateSessionID(),
        playerScores: []
      });

      const session = await newGameSession.save();
      res.status(200).json({ sessionID: session.sessionID });
    } catch (err) {
      this.handleError(res, err, 'Error starting new game.');
    }
  }

  // Retrieves a question of a given difficulty
  async getQuestion(req, res) {
    try {
      const difficulty = req.query.difficulty || 'easy'; // Default difficulty is 'easy'
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        return this.handleError(res, 'Invalid difficulty level.', 'Invalid difficulty level.', 400);
      }

      const question = await Question.getQuestion(difficulty);
      if (!question) {
        return this.handleError(res, 'No questions found for the specified difficulty.', 'No questions found.', 404);
      }
      res.status(200).json(question);
    } catch (err) {
      this.handleError(res, err, 'Error fetching question.');
    }
  }

  // Updates the score for a player in a game session
  async updateScore(req, res) {
    const { sessionID, playerID, score } = req.body;
    if (!sessionID || !playerID || typeof score !== 'number') {
      return this.handleError(res, 'Invalid request parameters.', 'Invalid request parameters.', 400);
    }

    try {
      const updateResult = await GameSession.updateOne(
        { sessionID: sessionID, 'playerScores.playerID': playerID },
        { $inc: { 'playerScores.$.score': score } },
        { upsert: true }
      );

      if (updateResult.nModified === 0) {
        // Handle case where playerScore does not exist
        await GameSession.updateOne(
          { sessionID: sessionID },
          { $push: { playerScores: { playerID, score } } }
        );
      }

      const session = await GameSession.findOne({ sessionID: sessionID });
      res.status(200).json(session.getCurrentLeaderboard());
    } catch (err) {
      this.handleError(res, err, 'Error updating score.');
    }
  }
}

module.exports = new GameController();
