'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

var TicTacToeCell = React.createClass({
  render() {
    return (
      <td className={this.props.className} onClick={this.props.cellClicked}>
        {this.props.cellChar}
      </td>
    );
  }
});


var TicTacToeBoard = React.createClass({

  getInitialState() {
    var board = [];
    for(var i = 0; i < this.props.boardSize; i++) {
      board.push([...Array(this.props.boardSize)].map(() => null));
    }
    return {board, currentPlayer: 0, winner: null};
  },

  resetToInitialState() {
    this.setState(this.getInitialState());
  },

  // check for wins, iterate through all cells and add to row/col/diag
  // array, check if all array elements are the same to win
  componentDidUpdate() {
    if(this.state.winner) return;  // just a safety, but unnecessary bc overlay

    // initialize all potential rows and columns plus two diagonals
    var rows = [];
    for(var i = 0; i < (this.props.boardSize * 2) + 2; i++) {
      rows.push([]);
    }

    for(var i = 0; i < this.props.boardSize; i++) {
      for(var j = 0; j < this.props.boardSize; j++) {

        var cellState = this.state.board[i][j];

        if(cellState == null) continue;  // skip empty cells

        // add move to correct row and column array
        rows[i].push(cellState);
        rows[this.props.boardSize + j].push(cellState);

        // add move to first diagonal array if on top left to bottom right
        if(i == j) {
          rows[rows.length - 2].push(cellState);
        }

        // add move to second diagonal array if on top right to bottom left
        if(i + j == this.props.boardSize - 1) {
          rows[rows.length - 1].push(cellState);
        }
      }
    }

    // check all rows/cols/diags for winner
    for(var row of rows) {
      var rowSet = new Set(row);

      if(row.length == this.props.boardSize && rowSet.size == 1) {
        this.setState({winner: Array.from(rowSet)[0]});
        break;
      }
    }
  },

  getAndIncrementCurrentPlayerChar() {
    var maxPlayers = this.props.playerChars.length;
    var currentPlayer = this.state.currentPlayer;
    var nextPlayer = (this.state.currentPlayer + 1) % maxPlayers;

    this.setState({currentPlayer: nextPlayer});
    return String.fromCharCode(this.props.playerChars[currentPlayer]);
  },

  cellClicked(i, j) {
    var board = this.state.board;
    if(board[i][j]) {
      return;  // do nothing if cell has non-null val
    } else {
      board[i][j] = this.getAndIncrementCurrentPlayerChar();
      this.setState({board});
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

        cells.push(
          <TicTacToeCell
            key={`cell-${i}${j}`}
            cellClicked={this.cellClicked.bind(this, i, j)}
            cellChar={this.state.board[i][j]}
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
          <div className='Board-reset' onClick={this.resetToInitialState}>Reset</div>
        </div>
      </div>
    );
  }
});


var TicTacToeManager = React.createClass({

  getInitialState() {
    return {numGames: 1};
  },

  handleClick() {
    this.setState({numGames: this.state.numGames + 1});
  },

  render() {
    var games = [...Array(this.state.numGames).keys()].map((i) =>
      <TicTacToeBoard
        // these are potentially exposable in the UI to be user configurable
        boardSize={3}
        playerChars={[10005, 9711]}
        key={`game-${i}`}
      />
    );
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
