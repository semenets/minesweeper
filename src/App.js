import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import './Minesweeper.css';

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
