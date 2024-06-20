import React, { useState, useEffect, useRef } from 'react';
import Cell from './Cell.js';

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

export default Board;