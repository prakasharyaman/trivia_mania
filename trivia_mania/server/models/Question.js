// server/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  choices: {
    type: [String],
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    index: true // Ensure that we have an index on the difficulty field for efficient querying
  }
});

// Static method to get a random question based on difficulty
questionSchema.statics.getQuestion = function(difficulty, callback) {
  // Use the aggregation framework to sample a random document matching the difficulty level
  this.aggregate([
    { $match: { difficulty: difficulty } },
    { $sample: { size: 1 } }
  ]).exec(callback);
};

// Create the model from the schema
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
