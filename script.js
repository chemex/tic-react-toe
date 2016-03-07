'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

var TicTacToeCell = React.createClass({
  getInitialState() {
    return {cellChar: null};
  },

  handleClick() {
    if(this.state.cellChar != null) return;
    this.setState({cellChar: this.props.getCurrentPlayerChar()});
  },

  resetCell() {
    this.setState({cellChar: null});
  },

  render() {
    return (
      <td className={this.props.className} onClick={this.handleClick}>
        {this.state.cellChar}
      </td>
    );
  }
});


var TicTacToeBoard = React.createClass({

  getInitialState() {
    return {currentPlayer: 0, winner: null};
  },

  // check for wins: this is kind of gross that we save all cells as refs,
  // but I think its a bit overkill to add something like redux for better
  // data show for something trivial like tic-tac-toe
  componentDidUpdate() {

    if(this.state.winner) return;

    // initialize all potential rows and columns plus two diagonals
    var rows = []
    for(var i = 0; i < (this.props.boardSize * 2) + 2; i++) {
      rows.push([])
    }

    for(var i = 0; i < this.props.boardSize; i++) {
      for(var j = 0; j < this.props.boardSize; j++) {

        var cellState = this.refs[`${i}${j}`].state.cellChar

        if(cellState == null) continue;  // dont allow multiple clicks

        // add move to correct row and column array
        rows[i].push(cellState)
        rows[this.props.boardSize  + j].push(cellState)

        // add move to first diagonal array if on top left to bottom right
        if(i == j) {
          rows[rows.length - 2].push(cellState)
        }

        // add move to second diagonal array if on top right to bottom left
        if(i + j == this.props.boardSize - 1) {
          rows[rows.length - 1].push(cellState)
        }
      }
    }

    for(var row of rows) {
      var rowSet = new Set(row)

      if(row.length == this.props.boardSize && rowSet.size == 1) {
        this.setState({winner: Array.from(rowSet)[0]})
      }
    }
  },

  getCurrentPlayerChar() {
    var maxPlayers = this.props.playerChars.length;
    var currentPlayer = this.state.currentPlayer;
    var nextPlayer = (this.state.currentPlayer + 1) % maxPlayers;

    this.setState({currentPlayer: nextPlayer});
    return String.fromCharCode(this.props.playerChars[currentPlayer]);
  },

  resetGame() {
    this.setState({currentPlayer: 0, winner: false});
    for(var cellKey in this.refs) {
      this.refs[cellKey].resetCell();
    }
  },

  render() {
    var rows = []
    for(var i = 0; i < this.props.boardSize; i++) {
      var cells = [];

      for(var j = 0; j < this.props.boardSize; j++) {
        var classNames = 'Cell';

        // determine which class names to add depending on if edge
        // cell, if so don't render borders for that edge
        if(i > 0 && i < this.props.boardSize - 1) {
          classNames += ' Cell--border-horizontal';
        }
        if(j > 0 && j < this.props.boardSize - 1) {
          classNames += ' Cell--border-vertical';
        }

        var cellLocation=`${i}${j}`

        cells.push(
          <TicTacToeCell
            key={`cell-${cellLocation}`}
            ref={cellLocation}
            position={[i, j]}
            getCurrentPlayerChar={this.getCurrentPlayerChar}
            className={classNames}
          />
        );
      }
      rows.push(<tr key={`row${i}`}>{cells}</tr>);
    }

    if(!this.state.winner) {
      var hideWinner = {display: 'none'}
    }
    return (
      <div className='Board'>
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
        <div className='Board-winner' style={hideWinner}>
          {this.state.winner} Wins!
          <div className='Board-reset' onClick={this.resetGame}>Reset</div>
        </div>
      </div>
    );
  }
});


var TicTacToeManager = React.createClass({

  getInitialState() {
    return {numGames: 1}
  },

  handleClick() {
    this.setState({numGames: this.state.numGames + 1})
  },

  render() {
    var games = [...Array(this.state.numGames).keys()].map((i) =>
      <TicTacToeBoard
        // these are potentially exposable in the UI to be user configurable
        boardSize={3}
        playerChars={[10005, 9711]}
        key={`game-${i}`}
      />
    )
    return (
      <div>
        {games}
        <div className='Board Board-placeholder' onClick={this.handleClick}>
          <div className='Board-placeholder-plus'>+</div>
          Click to Add Another Game
        </div>
      </div>
    );
  }
});


ReactDOM.render(
  <TicTacToeManager />,
  document.querySelector('.content')
);
