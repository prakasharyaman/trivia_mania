## client/components/Leaderboard.jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Leaderboard extends Component {
  static propTypes = {
    leaderboard: PropTypes.arrayOf(
      PropTypes.shape({
        playerID: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired
      })
    ).isRequired
  };

  renderLeaderboardEntries = () => {
    const { leaderboard } = this.props;

    return leaderboard.map((entry, index) => (
      <tr key={entry.playerID}>
        <td>{index + 1}</td>
        <td>{entry.playerID}</td>
        <td>{entry.score}</td>
      </tr>
    ));
  };

  render() {
    return (
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {this.renderLeaderboardEntries()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Leaderboard;
