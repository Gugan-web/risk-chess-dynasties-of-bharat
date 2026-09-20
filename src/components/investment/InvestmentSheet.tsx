import React from 'react';
import { useGameStore } from '../../store/game-store';
import { RiskOpportunity } from './RiskOpportunity';
import { CapitalDisplay } from './CapitalDisplay';

interface InvestmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestmentSheet: React.FC<InvestmentSheetProps> = ({ isOpen, onClose }) => {
  const {
    phase,
    config,
    capitalWhite,
    capitalBlack,
    currentOpportunity,
    handleInvestmentDecision,
  } = useGameStore();

  if (!isOpen && phase !== 'investment_prompt') return null;

  const playerCapital = config.playerColor === 'w' ? capitalWhite : capitalBlack;

  return (
    <>
      <div className="mobile-sheet-overlay" onClick={onClose} />
      <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Resource Decision Sheet">
        <div className="mobile-sheet-handle" />

        {phase === 'investment_prompt' && currentOpportunity ? (
          <RiskOpportunity
            opportunity={currentOpportunity}
            availableCapital={playerCapital.available}
            onInvest={(amount) => {
              handleInvestmentDecision(amount);
              onClose();
            }}
            onSkip={() => {
              handleInvestmentDecision(null);
              onClose();
            }}
          />
        ) : (
          <div>
            <CapitalDisplay
              capital={playerCapital}
              playerName={config.playerName}
              isTurn={true}
            />
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};
