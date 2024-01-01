// server.js
const App = require('./app'); // Import the App class from app.js

class Server {
  constructor() {
    this.app = new App(); // Instantiate the App class
    this.port = process.env.PORT || 3000; // Set the default port or use environment variable
  }

  start() {
    this.app.start(this.port); // Start the server using the port
  }
}

// Create a new Server instance and start it
const server = new Server();
server.start();
