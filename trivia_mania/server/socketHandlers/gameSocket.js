## server/socketHandlers/gameSocket.js
const GameSession = require('../models/GameSession');

class GameSocketHandler {
  constructor(io) {
    this.io = io;
  }

  // Dedicated error handling method
  emitError(socket, message, code = 'ERROR') {
    console.error(message);
    socket.emit('error', { code, message });
  }

  // Handle new socket connection
  handleConnection(socket) {
    console.log(`New client connected: ${socket.id}`);

    // Handle 'join game' event
    socket.on('join game', async (sessionID) => {
      try {
        await this.joinGame(socket, sessionID);
      } catch (error) {
        this.emitError(socket, error.message);
      }
    });

    // Handle 'leave game' event
    socket.on('leave game', (sessionID) => {
      this.leaveGame(socket, sessionID);
    });

    // Handle 'disconnect' event
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  }

  // Join a game session
  async joinGame(socket, sessionID) {
    try {
      const session = await GameSession.findOne({ sessionID: sessionID });
      if (!session) {
        throw new Error('Game session not found.');
      }

      const isAlreadyJoined = Array.from(socket.rooms).includes(sessionID);
      if (isAlreadyJoined) {
        throw new Error('Already joined the game session.');
      }

      socket.join(sessionID);
      console.log(`Client ${socket.id} joined game session: ${sessionID}`);
      socket.emit('joined game', sessionID);

      // Emit the current leaderboard when a player joins
      const leaderboard = session.getCurrentLeaderboard();
      this.updateLeaderboard(sessionID, leaderboard);
    } catch (error) {
      throw error;
    }
  }

  // Leave a game session
  leaveGame(socket, sessionID) {
    socket.leave(sessionID, (err) => {
      if (err) {
        this.emitError(socket, 'Error leaving game session.');
        return;
      }
      console.log(`Client ${socket.id} left game session: ${sessionID}`);
      socket.emit('left game', sessionID);
    });
  }

  // Emit event to update leaderboard to all clients in the session
  updateLeaderboard(sessionID, leaderboard) {
    this.io.to(sessionID).emit('update leaderboard', [...leaderboard]);
  }
}

// Export a function that creates a new GameSocketHandler instance and binds events
module.exports = (io) => {
  const gameSocketHandler = new GameSocketHandler(io);
  io.on('connection', gameSocketHandler.handleConnection.bind(gameSocketHandler));
};
