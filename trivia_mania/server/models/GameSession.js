## server/models/GameSession.js
const mongoose = require('mongoose');

// Define the schema for a game session
const gameSessionSchema = new mongoose.Schema({
  sessionID: {
    type: String,
    required: true,
    unique: true
  },
  playerScores: [{
    playerID: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      default: 0
    }
  }]
});

// Method to get the current leaderboard
gameSessionSchema.methods.getCurrentLeaderboard = function() {
  // Sort the playerScores array by score in descending order
  this.playerScores.sort((a, b) => b.score - a.score);
  // Create a new Map to represent the leaderboard
  const leaderboard = new Map();
  // Populate the leaderboard with player IDs and their scores
  this.playerScores.forEach(playerScore => {
    leaderboard.set(playerScore.playerID, playerScore.score);
  });
  return leaderboard;
};

// Create the model from the schema
const GameSession = mongoose.model('GameSession', gameSessionSchema);

module.exports = GameSession;
