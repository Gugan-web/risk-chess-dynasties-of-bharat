import React, { useState } from 'react';
import { Chessboard } from '../board/Chessboard';
import { useGameStore } from '../../store/game-store';
import { getDefaultConfig } from '../../engine/game-state';
import { PIECE_VALUES, formatCurrency } from '../../engine/piece-values';

interface TutorialScreenProps {
  onComplete: () => void;
  onExit: () => void;
}

interface TutorialStep {
  title: string;
  badge: string;
  text: string;
  task: string;
}

const STEPS: TutorialStep[] = [
  {
    title: '1. Sena Parichaya — Know Your Forces',
    badge: 'Kosh Pranali — Treasury System',
    text:
      'In Dynasties of Bharat, every piece commands a treasury value. ' +
      'A Padati (Infantry/Pawn) is worth 500 TR. An Ashva (Warhorse/Knight) or Acharya (Sage/Bishop) commands 1,000 TR. ' +
      'A Durg (Fortress/Rook) holds 1,500 TR. The Rajmata (Queen) is supreme at 3,000 TR. ' +
      'The Maharaja (King) is priceless — his fall ends the realm.',
    task: 'Every capture updates your treasury position. Continue to see how campaign decisions work.',
  },
  {
    title: '2. Rajniti Nirnay — The Decision Cycle',
    badge: 'Rajniti Chakra — Campaign Decisions',
    text:
      'When you execute a tactically meaningful strike, a Strategic Decision Review opens. ' +
      'Choose how many Treasury Reserves to commit to the campaign: 100, 250, 500, or 1,000 TR.',
    task: 'If your piece survives the sequence, the campaign generates treasury gain. If it is captured, the committed reserves are written down.',
  },
  {
    title: '3. Jokhim Kshamta — Calculated Risk',
    badge: 'Anishchitata — Risk Under Uncertainty',
    text:
      'Every decision review calculates strategic inputs: capture certainty, battle survival probability, and enemy counter-strike threat. ' +
      'Low-risk positions yield modest treasury gains. High-risk positions offer greater upside with heavier exposure. ' +
      'Chanakya wrote: "A king who has no treasury cannot maintain an army."',
    task: 'You are the commander. You receive battlefield intelligence, not automated orders.',
  },
  {
    title: '4. Abhyas Pranali — The Simulation',
    badge: 'Abhyas Pranali — Simulation System',
    text:
      'Treasury Reserves (TR) are fictional planning values. The goal is to practice strategic judgment: ' +
      'expected value, opportunity cost, exposure control, and disciplined tactical execution. ' +
      'This game is submitted as SIH26208 — a toy/game inspired by Indian civilisation.',
    task: 'Ready to command? Choose Yuddha (vs AI) or Sabha (local duel) from the Rajdarbar.',
  },
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onComplete, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="home-screen" style={{ justifyContent: 'flex-start', paddingTop: 'var(--space-10)' }}>
      <div className="home-content" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <span className="risk-opportunity-badge">{step.badge}</span>
          <span className="font-mono text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        <h2 className="home-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
          {step.title}
        </h2>

        <p className="home-subtitle" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          {step.text}
        </p>

        {/* Piece valuation table on step 1 */}
        {currentStep === 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
              textAlign: 'left',
            }}
          >
            {(['p', 'n', 'b', 'r', 'q', 'k'] as const).map((p) => (
              <div
                key={p}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {PIECE_VALUES[p].name}
                </div>
                <div className="font-mono text-accent" style={{ fontSize: 'var(--text-sm)' }}>
                  {p === 'k' ? 'Priceless' : formatCurrency(PIECE_VALUES[p].value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tactical preview on step 2 */}
        {currentStep === 1 && (
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-6)',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', marginBottom: 4 }}>
              SIMULATION EXAMPLE
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Ashva (Knight) seizes Acharya (Bishop) at f7</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
              Campaign: 500 TR · Risk: Medium · Projected Treasury Gain: +275 TR
            </div>
          </div>
        )}

        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-accent-glow)',
            border: '1px solid var(--color-accent-dim)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            marginBottom: 'var(--space-6)',
          }}
        >
          {step.task}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {currentStep > 0 && (
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={handlePrev}>
              Previous
            </button>
          )}
          <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={handleNext}>
            {currentStep === STEPS.length - 1 ? 'Enter Rajdarbar' : 'Continue'}
          </button>
          <button type="button" className="btn-secondary" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
