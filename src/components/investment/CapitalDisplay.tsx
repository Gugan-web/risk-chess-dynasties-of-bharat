import React from 'react';
import type { CapitalState } from '../../engine/capital';
import { formatCurrency } from '../../engine/piece-values';

interface CapitalDisplayProps {
  capital: CapitalState;
  playerName: string;
  isTurn: boolean;
}

export const CapitalDisplay: React.FC<CapitalDisplayProps> = ({
  capital,
  playerName,
  isTurn,
}) => {
  return (
    <div className={`capital-display ${isTurn ? 'capital-display--active' : ''}`}>
      <div className="capital-label">{playerName} Resources</div>
      <div className="capital-amount">{formatCurrency(capital.total)}</div>
      <div className="capital-breakdown">
        <div className="capital-breakdown-item">
          <div className="capital-breakdown-label">Available</div>
          <div className="capital-breakdown-value text-accent">
            {formatCurrency(capital.available)}
          </div>
        </div>
        <div className="capital-breakdown-item">
          <div className="capital-breakdown-label">Committed</div>
          <div className="capital-breakdown-value">
            {formatCurrency(capital.invested)}
          </div>
        </div>
      </div>
    </div>
  );
};
