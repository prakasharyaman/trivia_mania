// client/components/Question.jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';

class Question extends Component {
  static propTypes = {
    question: PropTypes.shape({
      text: PropTypes.string.isRequired,
      choices: PropTypes.arrayOf(PropTypes.string).isRequired,
      answer: PropTypes.string.isRequired
    }),
    onAnswerSelected: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedChoice: '',
      isAnswered: false
    };
  }

  handleChoiceChange = (event) => {
    this.setState({
      selectedChoice: event.target.value,
      isAnswered: false
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { onAnswerSelected } = this.props;
    const { selectedChoice } = this.state;

    onAnswerSelected(selectedChoice);
    this.setState({ isAnswered: true });
  };

  renderChoices = () => {
    const { question } = this.props;
    const { selectedChoice } = this.state;

    return question.choices.map((choice, index) => (
      <label key={index}>
        <input
          type="radio"
          value={choice}
          checked={selectedChoice === choice}
          onChange={this.handleChoiceChange}
          disabled={this.state.isAnswered}
        />
        {choice}
      </label>
    ));
  };

  render() {
    const { question } = this.props;
    const { isAnswered } = this.state;

    return (
      <div className="question">
        <form onSubmit={this.handleSubmit}>
          <fieldset disabled={isAnswered}>
            <legend>{question.text}</legend>
            {this.renderChoices()}
            <button type="submit" disabled={isAnswered || !this.state.selectedChoice}>
              Submit Answer
            </button>
          </fieldset>
        </form>
      </div>
    );
  }
}

export default Question;
