import React, { useEffect } from 'react';
import { formatCurrencyChange } from '../../engine/piece-values';
import { soundManager } from '../../utils/sound-manager';
import { useAppStore } from '../../store/app-store';

interface InvestmentResultProps {
  success: boolean;
  amount: number;
  returnAmount: number;
  description: string;
  onDismiss: () => void;
}

export const InvestmentResult: React.FC<InvestmentResultProps> = ({
  success,
  amount,
  returnAmount,
  description,
  onDismiss,
}) => {
  const { soundEnabled } = useAppStore();

  useEffect(() => {
    if (soundEnabled) {
      if (success) {
        soundManager.playSuccess();
      } else {
        soundManager.playFailure();
      }
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [success, soundEnabled, onDismiss]);

  return (
    <div
      className={`investment-result ${
        success ? 'investment-result--success' : 'investment-result--failure'
      }`}
      role="alert"
      onClick={onDismiss}
      style={{ cursor: 'pointer' }}
    >
      <span className="investment-result-amount">
        {success
          ? `${formatCurrencyChange(returnAmount)} Operational Impact`
          : `${formatCurrencyChange(returnAmount)} Resource Write-Down`}
      </span>
      <p className="investment-result-desc">{description}</p>
    </div>
  );
};
