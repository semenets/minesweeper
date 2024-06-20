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

export default Cell;