// app.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const gameRoutes = require('./server/routes/gameRoutes');
const gameSocket = require('./server/socketHandlers/gameSocket');

class App {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketio(this.server);
    this.initialize();
  }

  initialize() {
    // Middleware setup
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static('public')); // Serve static files from 'public' directory

    // Routes setup
    this.app.use('/api/game', gameRoutes);

    // Socket.IO setup
    this.io.on('connection', gameSocket.handleConnection);

    // Error handling
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
  }

  start(port = 3000) {
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

module.exports = App;
