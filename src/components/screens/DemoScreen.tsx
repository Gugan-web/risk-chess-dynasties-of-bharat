import React, { useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { GameScreen } from './GameScreen';
import { STARTING_CAPITAL } from '../../engine/piece-values';

interface DemoScreenProps {
  onReturnHome: () => void;
}

export const DemoScreen: React.FC<DemoScreenProps> = ({ onReturnHome }) => {
  const [demoStarted, setDemoStarted] = useState(false);
  const { initGame, engine } = useGameStore();

  const handleStartDemo = async () => {
    // Initialize game with beginner AI and a lively tactical position:
    // Position where White can immediately capture Black's pawn on e5 with Knight on f3 (Nxe5)
    // FEN: r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3
    await initGame({
      mode: 'demo',
      difficulty: 'beginner',
      playerColor: 'w',
      playerName: 'Judge',
      opponentName: 'AI Chakravartin',
      startingCapital: STARTING_CAPITAL,
    });

    // Set position where Ashva (Knight) on f3 can capture Padati (Pawn) on e5 immediately
    engine.reset('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');
    setDemoStarted(true);
  };

  if (demoStarted) {
    return (
      <div>
        <div
          style={{
            background: 'var(--color-accent-glow)',
            borderBottom: '1px solid var(--color-accent-dim)',
            padding: 'var(--space-2) var(--space-4)',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent)',
          }}
        >
          RAJDARBAR DEMO · Move the Ashva (Knight) from <strong>f3</strong> to seize the Padati (Pawn) on <strong>e5</strong> — triggers a Rajniti Nirnay review.
        </div>
        <GameScreen onReturnHome={onReturnHome} />
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="risk-opportunity-badge" style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }}>
          SIH26208 · Rajdarbar — Judge Showcase
        </div>

        <h1 className="home-title" style={{ fontSize: 'var(--text-3xl)' }}>
          Can you command the realm while protecting your treasury?
        </h1>

        <p className="home-subtitle" style={{ margin: 'var(--space-6) 0' }}>
          Experience strategy chess as a royal treasury-planning exercise — inspired by Indian civilisation and Chanakya's Arthashastra.
        </p>

        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            textAlign: 'left',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div>⚔ 1. Execute a tactical strike with your Ashva (Knight)</div>
          <div>📊 2. Assess survival probability, enemy counter-strike, and projected treasury impact</div>
          <div>💰 3. Sanction a treasury allocation (100 – 1,000 TR)</div>
          <div>📜 4. Review the campaign outcome after the sequence resolves</div>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', padding: 'var(--space-4)' }}
          onClick={handleStartDemo}
        >
          Launch Rajdarbar Demo ⚔
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: 'var(--space-3)' }}
          onClick={onReturnHome}
        >
          Return to Rajdarbar ←
        </button>
      </div>
    </div>
  );
};
