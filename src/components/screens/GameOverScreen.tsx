import React, { useEffect } from 'react';
import { useGameStore } from '../../store/game-store';
import { useAppStore } from '../../store/app-store';
import { formatCurrency, formatCurrencyChange } from '../../engine/piece-values';
import { getInvestmentSuccessRate } from '../../engine/investment';
import { deriveRiskProfile, updateProfileAfterGame } from '../../engine/profiles';
import { soundManager } from '../../utils/sound-manager';

interface GameOverScreenProps {
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  onPlayAgain,
  onReturnHome,
}) => {
  const {
    gameResult,
    winner,
    config,
    capitalWhite,
    capitalBlack,
    investmentHistoryWhite,
    investmentHistoryBlack,
  } = useGameStore();

  const { playerProfile, setPlayerProfile, soundEnabled } = useAppStore();

  const isPlayerWhite = config.playerColor === 'w';
  const playerWon = winner === config.playerColor;
  const isDraw = gameResult === 'stalemate' || gameResult === 'draw';

  const myCapital = isPlayerWhite ? capitalWhite : capitalBlack;
  const myInvestments = isPlayerWhite ? investmentHistoryWhite : investmentHistoryBlack;

  const successRate = getInvestmentSuccessRate(myInvestments);
  const netCapitalChange = myCapital.total - config.startingCapital;
  const settlementTransaction = [...myCapital.transactions]
    .reverse()
    .find(
      (transaction) =>
        transaction.type === 'match_settlement_gain' ||
        transaction.type === 'match_settlement_loss'
    );

  // Derive decision profile
  const totalDecisions = myInvestments.successCount + myInvestments.failureCount;
  const avgRiskEstimate =
    totalDecisions > 0
      ? Math.round(
          myInvestments.investments.reduce((acc, i) => acc + i.opportunity.analysis.riskScore, 0) /
            totalDecisions
        )
      : 50;

  const roi =
    myInvestments.totalInvested > 0
      ? Math.round(((myInvestments.totalReturned - myInvestments.totalLost) / myInvestments.totalInvested) * 100)
      : 0;

  const derived = deriveRiskProfile(avgRiskEstimate, roi, totalDecisions, successRate);

  // Update persistent player profile once on mount
  useEffect(() => {
    if (soundEnabled) {
      soundManager.playGameOver();
    }

    if (playerProfile) {
      const updated = updateProfileAfterGame(
        playerProfile,
        playerWon,
        isDraw,
        myInvestments,
        avgRiskEstimate
      );
      setPlayerProfile(updated);
    }
  }, []);

  // Result label
  const resultLabel =
    gameResult === 'checkmate'
      ? 'RAJYA VIJAY'
      : gameResult === 'stalemate'
      ? 'YUDDHAVIRATI'
      : gameResult === 'resign'
      ? 'SAMARPAN'
      : 'SANDHI — DRAW';

  return (
    <div className="game-over-screen">
      <div className="game-over-content">
        <div className="game-over-badge">Yuddha Vivaran — Battle Report</div>

        <h2 className="game-over-result">{resultLabel}</h2>

        <div className="game-over-winner font-heading">
          {isDraw
            ? 'Both commanders stand equal — the realm remains divided'
            : playerWon
            ? `⚔ ${config.playerName} Commands the Realm`
            : `⚔ ${config.opponentName} Prevails`}
        </div>

        <div className="game-over-profile-badge">
          Rajniti Shaili: {derived.profile}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          {derived.description}
        </p>

        {/* Final Resource Highlight */}
        <div className="game-over-final-capital">
          <div className="game-over-final-label">Rajya Kosh — Final Treasury</div>
          <div className="game-over-final-amount">{formatCurrency(myCapital.total)}</div>
          <div
            className={`font-mono ${netCapitalChange >= 0 ? 'text-success' : 'text-danger'}`}
            style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}
          >
            {formatCurrencyChange(netCapitalChange)} vs starting treasury
          </div>
        </div>

        {settlementTransaction && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-cyan-dim)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(109, 170, 160, 0.32)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
            }}
          >
            <strong className="text-accent">Royal Tribute Settlement: </strong>
            The battlefield result decided the victor. As the winner held fewer reserves,
            50% of the loser&apos;s surplus treasury was transferred as tribute
            {' '}
            <span className={settlementTransaction.amount >= 0 ? 'text-success' : 'text-danger'}>
              ({formatCurrencyChange(settlementTransaction.amount)})
            </span>
            .
          </div>
        )}

        {/* Performance Statistics Grid */}
        <div className="game-over-section">
          <div className="game-over-section-title">Ranaanga — Battlefield Performance</div>
          <div className="game-over-stats">
            <div className="game-over-stat">
              <span className="game-over-stat-label">Territory Value Seized</span>
              <span className="game-over-stat-value text-accent">
                {formatCurrency(myCapital.materialGained)}
              </span>
            </div>
            <div className="game-over-stat">
              <span className="game-over-stat-label">Territory Value Conceded</span>
              <span className="game-over-stat-value">
                {formatCurrency(myCapital.materialLost)}
              </span>
            </div>
          </div>
        </div>

        <div className="game-over-section">
          <div className="game-over-section-title">Kosh Nirnay — Treasury Decisions</div>
          <div className="game-over-stats">
            <div className="game-over-stat">
              <span className="game-over-stat-label">Total Treasury Committed</span>
              <span className="game-over-stat-value">
                {formatCurrency(myInvestments.totalInvested)}
              </span>
            </div>
            <div className="game-over-stat">
              <span className="game-over-stat-label">Positive Campaign Impact</span>
              <span className="game-over-stat-value text-success">
                {formatCurrencyChange(myInvestments.totalReturned)}
              </span>
            </div>
            <div className="game-over-stat">
              <span className="game-over-stat-label">Treasury Write-Downs</span>
              <span className="game-over-stat-value text-danger">
                {formatCurrencyChange(-myInvestments.totalLost)}
              </span>
            </div>
            <div className="game-over-stat">
              <span className="game-over-stat-label">Campaign Success Rate</span>
              <span className="game-over-stat-value">{successRate}%</span>
            </div>
          </div>
        </div>

        {/* Strategic Takeaway */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--color-accent)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            marginBottom: 'var(--space-6)',
          }}
        >
          <strong>Rajniti Sandesh — Strategic Counsel: </strong>
          {totalDecisions === 0
            ? 'You completed the campaign without committing treasury to tactical reviews. Conservative posture preserved reserves, but limited your operational upside.'
            : successRate > 65
            ? 'High campaign success rate indicates sound probability assessment and disciplined field positioning — the mark of a Maharathi.'
            : 'Several campaigns faced aggressive counter-attacks. Review defender strength before sanctioning high-risk treasury allocations.'}
        </div>

        <div className="game-over-actions">
          <button type="button" className="btn-primary" onClick={onPlayAgain}>
            Nayi Yudha ⚔
          </button>
          <button type="button" className="btn-secondary" onClick={onReturnHome}>
            Rajdarbar ←
          </button>
        </div>
      </div>
    </div>
  );
};
