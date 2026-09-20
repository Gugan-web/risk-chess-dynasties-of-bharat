import React, { useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { useAppStore } from '../../store/app-store';
import { Chessboard } from '../board/Chessboard';
import { InvestmentPanel } from '../investment/InvestmentPanel';
import { InvestmentSheet } from '../investment/InvestmentSheet';
import { InvestmentResult } from '../investment/InvestmentResult';
import { formatCurrency } from '../../engine/piece-values';

interface GameScreenProps {
  onReturnHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onReturnHome }) => {
  const {
    engine,
    config,
    aiThinking,
    moveHistory,
    capitalWhite,
    capitalBlack,
    investmentResult,
    undoMove,
    resign,
    dismissInvestmentResult,
  } = useGameStore();

  const { soundEnabled, toggleSound, boardFlipped, toggleBoardFlip } = useAppStore();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const turn = engine.getTurn();
  const isWhiteTurn = turn === 'w';
  const position = engine.getPosition();

  const playerCapital = config.playerColor === 'w' ? capitalWhite : capitalBlack;
  const opponentCapital = config.playerColor === 'w' ? capitalBlack : capitalWhite;

  const capturedPieces = engine.getCapturedPieces();

  return (
    <div className="game-screen">
      <main className="game-main">
        {/* Game Header */}
        <header className="game-header">
          <div className="game-player-info">
            <div>
              <span className="player-name">{config.playerName}</span>
              {config.mode === 'local' && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
                  {config.playerColor === 'w' ? 'Pandava ♔' : 'Kaurava ♚'}
                </div>
              )}
              <div className="player-capital font-mono">
                {formatCurrency(playerCapital.total)}
              </div>
            </div>

            <div className="captured-pieces" title="Pieces captured by your forces">
              {capturedPieces[config.playerColor === 'w' ? 'black' : 'white'].map((p, i) => (
                <span key={i} className="captured-piece font-mono">
                  {p.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div
            className={`turn-indicator ${aiThinking ? 'turn-indicator--thinking' : ''}`}
            aria-live="polite"
          >
            {position.isCheck
              ? '⚠ SHATRANJ CHECK!'
              : aiThinking
              ? 'AI Strategising...'
              : config.mode === 'local'
              ? `${isWhiteTurn === (config.playerColor === 'w') ? config.playerName : config.opponentName}'s Turn (${isWhiteTurn ? 'Pandava' : 'Kaurava'})`
              : `${isWhiteTurn ? 'Pandava' : 'Kaurava'} to Move`}
          </div>

          <div className="game-player-info game-player-info--right">
            <div className="captured-pieces" title="Pieces captured by opponent forces">
              {capturedPieces[config.playerColor === 'w' ? 'white' : 'black'].map((p, i) => (
                <span key={i} className="captured-piece font-mono">
                  {p.toUpperCase()}
                </span>
              ))}
            </div>
            <div>
              <span className="player-name">{config.opponentName}</span>
              {config.mode === 'local' && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
                  {config.playerColor === 'w' ? 'Kaurava ♚' : 'Pandava ♔'}
                </div>
              )}
              <div className="player-capital font-mono">
                {formatCurrency(opponentCapital.total)}
              </div>
            </div>
          </div>
        </header>

        {/* Center Chessboard */}
        <Chessboard />

        {/* Move History Strip */}
        <div className="move-history" aria-label="Move History">
          <div className="move-history-list">
            {moveHistory.length === 0 && (
              <span style={{ color: 'var(--text-tertiary)' }}>No moves yet — declare your first strike</span>
            )}
            {moveHistory.map((m, idx) => {
              const moveNum = Math.floor(idx / 2) + 1;
              const isWhiteMove = idx % 2 === 0;
              return (
                <span key={idx}>
                  {isWhiteMove && <span className="move-number">{moveNum}.</span>}
                  <span className={`move-san ${m.captured ? 'move-san--capture' : ''}`}>
                    {m.san}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Game Footer Actions */}
        <footer className="game-footer">
          <div className="game-controls">
            <button
              type="button"
              className="game-control-btn"
              onClick={undoMove}
              disabled={moveHistory.length === 0 || aiThinking}
            >
              Viram ↩
            </button>
            <button
              type="button"
              className="game-control-btn"
              onClick={resign}
              disabled={aiThinking}
            >
              Samarpan ⚑
            </button>
            <button
              type="button"
              className="game-control-btn"
              onClick={toggleBoardFlip}
              title="Flip Board"
            >
              Flip ↺
            </button>
            <button
              type="button"
              className="game-control-btn"
              onClick={toggleSound}
              title="Toggle Audio"
            >
              {soundEnabled ? 'Sound ♪' : 'Muted ✕'}
            </button>
            <button
              type="button"
              className="game-control-btn"
              onClick={onReturnHome}
            >
              Vapis ←
            </button>
          </div>

          {/* Mobile button to open bottom sheet */}
          <button
            type="button"
            className="game-control-btn text-accent"
            style={{ display: 'none' }} /* Visible on mobile via CSS */
            id="mobile-capital-btn"
            onClick={() => setMobileSheetOpen(true)}
          >
            Rajya Kosh: {formatCurrency(playerCapital.available)}
          </button>
        </footer>
      </main>

      {/* Desktop Investment Panel */}
      <InvestmentPanel />

      {/* Mobile Investment Bottom Sheet */}
      <InvestmentSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
      />

      {/* Resolution Toast */}
      {investmentResult && (
        <InvestmentResult
          success={investmentResult.success}
          amount={investmentResult.amount}
          returnAmount={investmentResult.returnAmount}
          description={investmentResult.description}
          onDismiss={dismissInvestmentResult}
        />
      )}
    </div>
  );
};
