import React, { useState } from 'react';
import {
  calculateExpectedReturn,
  calculatePotentialGain,
  calculatePotentialLoss,
  type InvestmentOpportunity,
} from '../../engine/risk-calculator';
import { RiskMeter } from './RiskMeter';
import { formatCurrency, formatCurrencyChange, INVESTMENT_PRESETS } from '../../engine/piece-values';
import { soundManager } from '../../utils/sound-manager';
import { useAppStore } from '../../store/app-store';

interface RiskOpportunityProps {
  opportunity: InvestmentOpportunity;
  availableCapital: number;
  onInvest: (amount: number) => void;
  onSkip: () => void;
}

export const RiskOpportunity: React.FC<RiskOpportunityProps> = ({
  opportunity,
  availableCapital,
  onInvest,
  onSkip,
}) => {
  const { soundEnabled } = useAppStore();
  const affordablePresets = INVESTMENT_PRESETS.filter((p) => p <= availableCapital);
  const defaultAmount = affordablePresets[0] || INVESTMENT_PRESETS[0];
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);

  const { analysis } = opportunity;
  const expectedReturn = calculateExpectedReturn(selectedAmount, analysis);
  const successImpact = calculatePotentialGain(selectedAmount, analysis.riskLevel);
  const failureWriteDown = calculatePotentialLoss(selectedAmount, analysis.riskLevel);

  const handleInvestConfirm = () => {
    if (selectedAmount > availableCapital) return;
    if (soundEnabled) soundManager.playInvest();
    onInvest(selectedAmount);
  };

  return (
    <div className="risk-opportunity">
      <div className="risk-opportunity-header">
        <span className="risk-opportunity-badge">Rajniti Nirnay — Strategic Decision</span>
      </div>

      <div className="risk-opportunity-title">
        {analysis.capturingPiece.toUpperCase()} captures {analysis.capturedPiece.toUpperCase()}
      </div>

      <p className="risk-opportunity-desc">{analysis.description}</p>

      <RiskMeter score={analysis.riskScore} level={analysis.riskLevel} />

      <div className="risk-stats" style={{ marginTop: 'var(--space-4)' }}>
        <div className="risk-stat">
          <span className="risk-stat-label">Captured Territory Value</span>
          <span className="risk-stat-value text-accent">
            {formatCurrency(analysis.captureValue)}
          </span>
        </div>
        <div className="risk-stat">
          <span className="risk-stat-label">Battle Survival Probability</span>
          <span className="risk-stat-value">
            {analysis.survivalProbability}%
          </span>
        </div>
        <div className="risk-stat">
          <span className="risk-stat-label">Enemy Counter-Strike</span>
          <span className="risk-stat-value" style={{ textTransform: 'capitalize' }}>
            {analysis.opponentThreat.toLowerCase()}
          </span>
        </div>
        <div className="risk-stat">
          <span className="risk-stat-label">Est. Write-Down (if captured)</span>
          <span className="risk-stat-value text-danger font-mono">
            -{formatCurrency(failureWriteDown)}
          </span>
        </div>
        <div className="risk-stat">
          <span className="risk-stat-label">Est. Treasury Gain (if survived)</span>
          <span className="risk-stat-value text-success font-mono">
            +{formatCurrency(successImpact)}
          </span>
        </div>
        <div className="risk-stat">
          <span className="risk-stat-label">Statistical Expected Impact</span>
          <span className={`risk-stat-value ${expectedReturn >= 0 ? 'text-success' : 'text-danger'} font-mono`}>
            {formatCurrencyChange(expectedReturn)}
          </span>
        </div>
      </div>

      <div className="invest-actions">
        <div className="capital-label" style={{ marginBottom: 4 }}>Select Treasury Allocation</div>
        <div className="invest-amounts">
          {INVESTMENT_PRESETS.map((amount) => {
            const isAffordable = amount <= availableCapital;
            const isSelected = selectedAmount === amount;

            return (
              <button
                key={amount}
                type="button"
                className={`invest-amount-btn ${isSelected ? 'invest-amount-btn--selected' : ''}`}
                onClick={() => setSelectedAmount(amount)}
                disabled={!isAffordable}
                title={!isAffordable ? 'Insufficient treasury reserves' : undefined}
              >
                {formatCurrency(amount)}
              </button>
            );
          })}
        </div>

        <div className="risk-breakdown-card">
          <div className="risk-breakdown-row">
            <span>Escrow Allocation:</span>
            <span className="risk-breakdown-val">{formatCurrency(selectedAmount)} (held from available)</span>
          </div>
          <div className="risk-breakdown-row">
            <span>If Captured (Est. Write-Down):</span>
            <span className="risk-breakdown-val text-danger">-{formatCurrency(failureWriteDown)} ({formatCurrency(selectedAmount - failureWriteDown)} returned)</span>
          </div>
          <div className="risk-breakdown-row">
            <span>If Survived (Est. Treasury Gain):</span>
            <span className="risk-breakdown-val text-success">+{formatCurrency(successImpact)} (+{formatCurrency(selectedAmount)} returned)</span>
          </div>
        </div>

        <div className="invest-confirm-row">
          <button
            type="button"
            className="btn-invest"
            onClick={handleInvestConfirm}
            disabled={selectedAmount > availableCapital}
          >
            Sanction Campaign · {formatCurrency(selectedAmount)}
          </button>
          <button type="button" className="btn-skip" onClick={onSkip}>
            Hold Campaign
          </button>
        </div>
      </div>
    </div>
  );
};
