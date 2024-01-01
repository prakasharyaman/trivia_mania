import React, { Component } from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';
import Question from './Question';
import Leaderboard from './Leaderboard';

class Game extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired // The server endpoint for the socket connection
  };

  constructor(props) {
    super(props);
    this.state = {
      sessionID: null,
      question: null,
      leaderboard: [],
      isGameStarted: false,
      errorMessage: '',
      isLoading: false
    };
    this.socket = null;
  }

  componentDidMount() {
    this.initializeSocketConnection();
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  initializeSocketConnection = () => {
    const { endpoint } = this.props;
    this.socket = socketIOClient(endpoint);

    this.socket.on('joined game', (sessionID) => {
      this.setState({ sessionID, isGameStarted: true });
    });

    this.socket.on('update leaderboard', (leaderboard) => {
      this.setState({ leaderboard });
    });

    this.socket.on('error', (error) => {
      this.handleError('A socket error occurred. Please try again.', error);
    });
  };

  handleError = (message, error = {}) => {
    console.error(message, error);
    this.setState({ errorMessage: message, isLoading: false });
  };

  handleFetch = (url, options = {}) => {
    this.setState({ isLoading: true });
    fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => this.handleResponse(url, data))
      .catch(error => this.handleError('A network error occurred. Please try again.', error));
  };

  handleResponse = (url, data) => {
    if (url.includes('/api/game/start')) {
      this.socket.emit('join game', data.sessionID);
    } else if (url.includes('/api/game/question')) {
      this.setState({ question: data });
    } else if (url.includes('/api/game/score')) {
      this.setState({ leaderboard: data });
      this.getQuestion(); // Fetch the next question
    }
    this.setState({ isLoading: false });
  };

  startNewGame = () => {
    this.handleFetch('/api/game/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  getQuestion = (difficulty = 'easy') => {
    this.handleFetch(`/api/game/question?difficulty=${difficulty}`);
  };

  handleAnswerSelected = (selectedChoice) => {
    const { question, sessionID } = this.state;
    const isCorrect = selectedChoice === question.answer;
    const score = isCorrect ? 1 : 0;

    this.handleFetch('/api/game/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionID: sessionID,
        playerID: this.socket.id,
        score: score
      })
    });
  };

  render() {
    const { question, leaderboard, isGameStarted, errorMessage, isLoading } = this.state;

    return (
      <div className="game">
        {isLoading && <p>Loading...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!isGameStarted && !isLoading && (
          <button onClick={this.startNewGame}>Start New Game</button>
        )}
        {isGameStarted && question && (
          <Question
            question={question}
            onAnswerSelected={this.handleAnswerSelected}
          />
        )}
        {isGameStarted && (
          <Leaderboard leaderboard={leaderboard} />
        )}
      </div>
    );
  }
}

export default Game;
