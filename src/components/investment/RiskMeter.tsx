import React from 'react';
import type { RiskLevel } from '../../engine/risk-calculator';
import { getRiskLabel } from '../../engine/risk-calculator';

interface RiskMeterProps {
  score: number; // 0–100
  level: RiskLevel;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level }) => {
  const levelClass =
    level === 'LOW'
      ? 'risk-meter-fill--low'
      : level === 'MEDIUM'
      ? 'risk-meter-fill--medium'
      : 'risk-meter-fill--high';

  return (
    <div>
      <div className="risk-meter" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`risk-meter-fill ${levelClass}`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>
      <div className="risk-level-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Risk Level</span>
        <span
          style={{
            fontWeight: 600,
            color:
              level === 'LOW'
                ? 'var(--color-success)'
                : level === 'MEDIUM'
                ? 'var(--color-accent)'
                : 'var(--color-danger)',
          }}
        >
          {level} ({getRiskLabel(score)})
        </span>
      </div>
    </div>
  );
};
