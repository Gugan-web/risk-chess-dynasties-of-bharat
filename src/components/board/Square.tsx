import React from 'react';
import type { Square as ChessSquare, PieceSymbol, Color } from 'chess.js';
import { Piece } from './Piece';

interface SquareProps {
  square: ChessSquare;
  piece: { type: PieceSymbol; color: Color } | null;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isInvested: boolean;
  isLegalMove: boolean;
  isCaptureMove: boolean;
  showFileLabel: boolean;
  showRankLabel: boolean;
  onClick: () => void;
}

export const Square: React.FC<SquareProps> = ({
  square,
  piece,
  isLight,
  isSelected,
  isLastMove,
  isCheck,
  isInvested,
  isLegalMove,
  isCaptureMove,
  showFileLabel,
  showRankLabel,
  onClick,
}) => {
  const file = square[0];
  const rank = square[1];

  let squareClasses = `square ${isLight ? 'square--light' : 'square--dark'}`;
  if (isSelected) squareClasses += ' square--selected';
  if (isLastMove) squareClasses += ' square--last-move';
  if (isCheck) squareClasses += ' square--check';

  return (
    <button
      type="button"
      className={squareClasses}
      onClick={onClick}
      data-square={square}
      aria-label={`Square ${square}${piece ? `, ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`}
    >
      {showRankLabel && <span className="square-label square-label--rank">{rank}</span>}
      {showFileLabel && <span className="square-label square-label--file">{file}</span>}

      {piece && (
        <Piece
          type={piece.type}
          color={piece.color}
          isInvested={isInvested}
        />
      )}

      {isLegalMove && !isCaptureMove && (
        <div className="move-indicator move-indicator--dot" />
      )}
      {isLegalMove && isCaptureMove && (
        <div className="move-indicator move-indicator--capture" />
      )}
    </button>
  );
};
