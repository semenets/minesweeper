import React, { useState, useEffect, useRef } from 'react';
import './Minesweeper.css';

function Cell({ cell, onClick, onRightClick }) {
  const getNumberColor = (number) => {
    switch (number) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'red';
      default:
        return 'black';
    }
  };

  const cellContent = cell.isRevealed ? (cell.isMine ? '💣' : (cell.neighboringMines || '')) : '';
  const cellStyle = {
    color: getNumberColor(cell.neighboringMines),
  };

  return (
    <div
      className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isMine && cell.isRevealed ? 'mine' : ''}`}
      onClick={onClick}
      onContextMenu={onRightClick}
      style={cellStyle}>
      {cellContent}
    </div>
  );
}

function Board({ rows, cols, mines, onGameOver, onGameWin, resetGame, onCellClick }) {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameEndedClick, setGameEndedClick] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showGameOverAlert] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const newBoard = generateBoard(rows, cols, mines);
    setBoard(newBoard);
    setGameOver(false);
    setGameEndedClick(false);
    setTimerRunning(false);
    clearInterval(timerRef.current);
  }, [rows, cols, mines, resetGame]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const generateBoard = (rows, cols, mines) => {
    const newBoard = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
      isRevealed: false,
      isMine: false,
      neighboringMines: 0,
    })));

    for (let i = 0; i < mines; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * rows);
        col = Math.floor(Math.random() * cols);
      } while (newBoard[row][col].isMine);
      newBoard[row][col].isMine = true;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let neighboringMines = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const newRow = r + i;
              const newCol = c + j;
              if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && newBoard[newRow][newCol].isMine) {
                neighboringMines++;
              }
            }
          }
          newBoard[r][c].neighboringMines = neighboringMines;
        }
      }
    }
    return newBoard;
  };

  const handleClick = (row, col) => {
    if ((gameOver && !showGameOverAlert) || board[row][col].isRevealed || gameEndedClick) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      setTimerRunning(false);
      setTimeout(() => {
        onGameOver();
      }, 100);
      return;
    }

    revealCell(newBoard, row, col);
    setBoard(newBoard);

    const remainingCells = newBoard.reduce((total, row) => total + row.filter(cell => !cell.isRevealed).length, 0);
    const remainingMines = mines - newBoard.reduce((total, row) => total + row.filter(cell => cell.isRevealed && cell.isMine).length, 0);

    if (remainingCells === remainingMines) {
      setGameOver(true);
      setTimerRunning(false);
      setTimeout(() => {
        onGameWin();
      }, 100);
    }
  };

  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameOver) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    setBoard(newBoard);
  };

  const revealCell = (board, row, col) => {
    if (board[row][col].isRevealed) return;
    board[row][col].isRevealed = true;
    if (board[row][col].neighboringMines === 0 && !board[row][col].isMine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newRow = row + i;
          const newCol = col + j;
          if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            revealCell(board, newRow, newCol);
          }
        }
      }
    }
  };

  return (
    <div className="board-container">
      <div className="board-border">
        <div className="board" style={{ gridTemplateColumns: `repeat(${cols}, 25px)` }}>
          {board.map((row, rIndex) =>
            row.map((cell, cIndex) => (
              <Cell
                key={`${rIndex}-${cIndex}`}
                cell={cell}
                onClick={() => {
                  if (!timerRunning) {
                    setTimerRunning(true);
                  }
                  onCellClick();
                  handleClick(rIndex, cIndex);
                }}
                onRightClick={(e) => handleRightClick(e, rIndex, cIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Minesweeper() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [mines, setMines] = useState(100);
  const [gameConfig, setGameConfig] = useState({ rows: 20, cols: 20, mines: 100 });
  const [resetGame, setResetGame] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverAlert, setShowGameOverAlert] = useState(false);

  useEffect(() => {
    let interval;
    if (timerRunning && !gameOver) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!timerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer, gameOver]);

  const handleStartGame = () => {
    const totalCells = rows * cols;
    if (rows < 2 || cols < 2) {
      alert('Rows and columns must be at least 2');
      return;
    }
    if (rows > 100 || cols > 100) {
      alert('The value must be less or equal to 100');
      return;
    }
    if (mines < 1) {
      alert('The minimum value for the Mines field must be at least 1');
      return;
    }
    if (mines >= totalCells) {
      alert('The number of mines cannot exceed the number of cells');
      return;
    }
    setGameConfig({ rows, cols, mines });
    setResetGame(prev => !prev);
    setTimer(0);
    setTimerRunning(false);
    setShowGameOverAlert(false);
    setGameOver(false);
  };

  const handleGameOver = () => {
    setTimeout(() => {
      alert('You lost! Try again.');
    }, 100);
    setTimerRunning(false);
    setShowGameOverAlert(true);
    setGameOver(true);
  };

  const handleGameWin = () => {
    setTimeout(() => {
      alert('You won! Congratulations! 🏆🎉');
    }, 100);
    setTimerRunning(false);
    setShowGameOverAlert(true);
    setGameOver(true);
  };

  const handleCellClick = () => {
    if (!timerRunning) {
      setTimerRunning(true);
    }
  };

  return (
    <div className="minesweeper">
      <b className="custom-game">Custom Game</b>
      <div className="settings">
        <label htmlFor="cols" className="label-text">Width:</label>
        <input
          className="input-field"
          type="number"
          id="cols"
          min="2"
          max="100"
          value={cols}
          onChange={(e) => setCols(parseInt(e.target.value))}
        />
        <label htmlFor="rows" className="label-text">Height:</label>
        <input
          className="input-field"
          type="number"
          id="rows"
          min="2"
          max="100"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value))}
        />
        <label htmlFor="mines" className="label-text">Mines:</label>
        <input
          className="input-field"
          type="number"
          id="mines"
          min="1"
          max="9800"
          value={mines}
          onChange={(e) => setMines(parseInt(e.target.value))}
        />
        <button onClick={handleStartGame} className="button-update">Update</button>
        <div className="timer">{timer}</div>
      </div>
      <Board
        rows={gameConfig.rows}
        cols={gameConfig.cols}
        mines={gameConfig.mines}
        onGameOver={handleGameOver}
        onGameWin={handleGameWin}
        resetGame={resetGame}
        onCellClick={handleCellClick}
      />
      {showGameOverAlert && <div className="game-over-alert">Game Over!</div>}
    </div>
  );
}

export default Minesweeper;
