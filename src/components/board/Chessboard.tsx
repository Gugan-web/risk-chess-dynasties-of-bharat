import React, { useState } from 'react';
import type { Square as ChessSquare, PieceSymbol } from 'chess.js';
import { useGameStore } from '../../store/game-store';
import { useAppStore } from '../../store/app-store';
import { Square } from './Square';
import { soundManager } from '../../utils/sound-manager';

export const Chessboard: React.FC = () => {
  const {
    engine,
    selectedSquare,
    legalMoves,
    lastMove,
    selectSquare,
    makePlayerMove,
    investmentHistoryWhite,
    investmentHistoryBlack,
  } = useGameStore();

  const { boardFlipped, soundEnabled } = useAppStore();
  const [promotionPending, setPromotionPending] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);

  const position = engine.getPosition();
  const turn = engine.getTurn();

  // King in check position
  let checkSquare: ChessSquare | null = null;
  if (position.isCheck) {
    const board = engine.getBoardArray();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          const files = 'abcdefgh';
          checkSquare = `${files[c]}${8 - r}` as ChessSquare;
        }
      }
    }
  }

  // Active invested squares
  const investedSquares = new Set<string>();
  [...investmentHistoryWhite.investments, ...investmentHistoryBlack.investments].forEach((inv) => {
    if (inv.status === 'active') {
      investedSquares.add(inv.pieceSquare);
    }
  });

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = boardFlipped ? [...files].reverse() : files;
  const displayedRanks = boardFlipped ? [...ranks].reverse() : ranks;

  const handleSquareClick = (square: ChessSquare) => {
    if (promotionPending) return;

    if (selectedSquare) {
      const move = legalMoves.find((m) => m.to === square);
      if (move) {
        // Promotion check
        if (move.piece === 'p' && (square[1] === '8' || square[1] === '1')) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        if (soundEnabled) {
          if (move.captured) {
            soundManager.playCapture();
          } else {
            soundManager.playMove();
          }
        }
        selectSquare(square);
        return;
      }
    }

    const piece = engine.getPieceAt(square);
    if (piece && piece.color === turn) {
      if (soundEnabled) soundManager.playMove();
    }
    selectSquare(square);
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!promotionPending) return;
    if (soundEnabled) soundManager.playMove();
    makePlayerMove(promotionPending.from, promotionPending.to, piece);
    setPromotionPending(null);
  };

  return (
    <div className="board-container">
      <div
        className={`chessboard ${boardFlipped ? 'chessboard--flipped' : ''}`}
        role="grid"
        aria-label="Chess Board"
      >
        {displayedRanks.map((rank, rankIdx) =>
          displayedFiles.map((file, fileIdx) => {
            const sq = `${file}${rank}` as ChessSquare;
            const piece = engine.getPieceAt(sq);
            const isLight = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 !== 0;

            const isSelected = selectedSquare === sq;
            const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
            const isKingInCheck = checkSquare === sq;
            const isInvested = investedSquares.has(sq);

            const legalMove = legalMoves.find((m) => m.to === sq);
            const isLegal = !!legalMove;
            const isCapture = !!legalMove?.captured;

            const showRankLabel = fileIdx === 0;
            const showFileLabel = rankIdx === 7;

            return (
              <Square
                key={sq}
                square={sq}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isLastMove={isLastMove}
                isCheck={isKingInCheck}
                isInvested={isInvested}
                isLegalMove={isLegal}
                isCaptureMove={isCapture}
                showFileLabel={showFileLabel}
                showRankLabel={showRankLabel}
                onClick={() => handleSquareClick(sq)}
              />
            );
          })
        )}
      </div>

      {promotionPending && (
        <div className="promotion-overlay">
          <div className="promotion-dialog">
            {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((p) => (
              <button
                key={p}
                type="button"
                className="promotion-option"
                onClick={() => handlePromotionSelect(p)}
                aria-label={`Promote to ${p.toUpperCase()}`}
              >
                <span style={{ fontSize: '1.8rem' }}>
                  {turn === 'w'
                    ? p === 'q' ? '♕' : p === 'r' ? '♖' : p === 'b' ? '♗' : '♘'
                    : p === 'q' ? '♛' : p === 'r' ? '♜' : p === 'b' ? '♝' : '♞'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
