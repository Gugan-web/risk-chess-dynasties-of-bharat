import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
  isInvested?: boolean;
}

export const Piece: React.FC<PieceProps> = ({ type, color, isInvested }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#f8f6f0' : '#22201d';
  const stroke = isWhite ? '#33312e' : '#f0ece1';
  const strokeWidth = 1.5;

  return (
    <div
      className={`square-piece ${isInvested ? 'square-piece--invested' : ''}`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${type.toUpperCase()}`}
    >
      <svg
        viewBox="0 0 45 45"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        {renderPiecePath(type, fill, stroke, strokeWidth, isWhite)}
      </svg>
      {isInvested && <div className="square-investment-dot" title="Active Assignment" />}
    </div>
  );
};

function renderPiecePath(
  type: PieceSymbol,
  fill: string,
  stroke: string,
  strokeWidth: number,
  isWhite: boolean
) {
  const commonProps = {
    fill,
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'p': // Pawn
      return (
        <path
          d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
          {...commonProps}
        />
      );

    case 'n': // Knight
      return (
        <path
          d="m 22,10 c -3,0 -7,1 -9,6 0,0 2,1 3,1 0,2 -2,4 -3,6 -1,2 -1,4 1,5 1,1 3,0 4,-1 1,2 3,3 5,3 2,0 4,-1 5,-3 0,0 1,2 3,2 2,0 3,-2 3,-4 0,-4 -4,-7 -4,-11 0,-3 -4,-5 -8,-5 z m -8,25 c 0,-4 3,-7 7,-8 4,1 7,4 7,8 z"
          {...commonProps}
        />
      );

    case 'b': // Bishop
      return (
        <g {...commonProps}>
          <path d="M 9,36 C 12.33,35 15.67,35 19,36 C 19.5,32.67 20,29.33 20.5,26 C 18,24 16,20 16,16 C 16,11 19,7 22.5,7 C 26,7 29,11 29,16 C 29,20 27,24 24.5,26 C 25,29.33 25.5,32.67 26,36 C 29.33,35 32.67,35 36,36 C 36,37.5 35,39 33.5,40 C 26,40 19,40 11.5,40 C 10,39 9,37.5 9,36 z" />
          <circle cx="22.5" cy="5" r="1.8" fill={stroke} />
          <path
            d="m 17.5,16 h 10 M 22.5,11 v 10"
            stroke={isWhite ? '#666' : '#bbb'}
            strokeWidth={1.2}
          />
        </g>
      );

    case 'r': // Rook
      return (
        <path
          d="m 9,39 h 27 v -3 H 9 z m 3,-3 h 21 v -4 H 12 z m 2.5,-4 h 16 v -14 h -16 z M 9,18 h 4.5 v 3 h 4 v -3 h 4 v 3 h 4 v -3 h 4.5 v 3 H 34 v -7 H 9 z"
          {...commonProps}
        />
      );

    case 'q': // Queen
      return (
        <g {...commonProps}>
          <path d="m 9,38 h 27 v -2.5 H 9 z m 2.5,-3 h 22 v -3 h -22 z m 2.5,-3 1.5,-15 7,7 4,-12 4,12 7,-7 1.5,15 z" />
          <circle cx="9" cy="14" r="2" fill={stroke} />
          <circle cx="15.5" cy="18" r="2" fill={stroke} />
          <circle cx="22.5" cy="11" r="2" fill={stroke} />
          <circle cx="29.5" cy="18" r="2" fill={stroke} />
          <circle cx="36" cy="14" r="2" fill={stroke} />
        </g>
      );

    case 'k': // King
      return (
        <g {...commonProps}>
          <path d="M 22.5,11.5 V 6 M 20,8.5 H 25" stroke={stroke} strokeWidth={1.8} />
          <path d="m 9,38 h 27 v -2.5 H 9 z m 2.5,-3 h 22 v -3 h -22 z m 3,-3 c 0,-4 2,-9 8,-12 6,3 8,8 8,12 z" />
          <circle cx="22.5" cy="16" r="3.5" fill={fill} />
        </g>
      );

    default:
      return null;
  }
}
