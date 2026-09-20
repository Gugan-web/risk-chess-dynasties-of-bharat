import React, { useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { CapitalDisplay } from './CapitalDisplay';
import { RiskOpportunity } from './RiskOpportunity';
import { formatCurrency } from '../../engine/piece-values';
import { getActiveInvestments } from '../../engine/investment';

// ─── Bharat Codex — rotating historical insights ───
const CODEX_INSIGHTS = [
  "Chanakya in Arthashastra: 'A king who has no treasury cannot maintain an army.'",
  "Kurukshetra principle: Every soldier's survival is a resource decision for the king.",
  "Akbar's Mansabdari: Officers were ranked by cavalry they could field — a direct capital measure.",
  "Nalanda scholars advised kings: patience in defence multiplies long-term treasury yield.",
  "Tipu Sultan's rockets: High-risk deployment with maximum territorial upside.",
  "Maurya Empire: Spies assessed battlefield odds before generals committed their forces.",
];

const PIECE_CODEX = [
  { symbol: 'Maharaja ♔', note: 'The throne — priceless, irreplaceable' },
  { symbol: 'Rajmata ♛', note: '3,000 TR — supreme battlefield authority' },
  { symbol: 'Durg ♜', note: '1,500 TR — fortress, anchor of position' },
  { symbol: 'Acharya ♝', note: '1,000 TR — sage advisor, diagonal wisdom' },
  { symbol: 'Ashva ♞', note: '1,000 TR — warhorse, unconventional strikes' },
  { symbol: 'Padati ♟', note: '500 TR — infantry, backbone of every campaign' },
];

export const InvestmentPanel: React.FC = () => {
  const {
    phase,
    config,
    engine,
    capitalWhite,
    capitalBlack,
    investmentHistoryWhite,
    investmentHistoryBlack,
    currentOpportunity,
    handleInvestmentDecision,
  } = useGameStore();

  const [codexOpen, setCodexOpen] = useState(false);

  const turn = engine.getTurn();
  const isWhiteTurn = turn === 'w';
  const position = engine.getPosition();

  // Rotate insight by move number
  const insight = CODEX_INSIGHTS[position.moveNumber % CODEX_INSIGHTS.length];

  // Resources to display
  const isLocal = config.mode === 'local';
  const playerCapital = config.playerColor === 'w' ? capitalWhite : capitalBlack;
  const opponentCapital = config.playerColor === 'w' ? capitalBlack : capitalWhite;

  const currentInvestments = [
    ...getActiveInvestments(investmentHistoryWhite),
    ...getActiveInvestments(investmentHistoryBlack),
  ];

  return (
    <aside className="investment-panel" aria-label="Rajya Kosh — Treasury & Strategy Panel">
      <div className="panel-section-header">Rajya Kosh — Treasury Desk</div>

      {isLocal ? (
        <>
          <CapitalDisplay
            capital={capitalWhite}
            playerName={config.playerColor === 'w' ? `${config.playerName} (Pandava)` : `${config.opponentName} (Pandava)`}
            isTurn={isWhiteTurn}
          />
          <CapitalDisplay
            capital={capitalBlack}
            playerName={config.playerColor === 'b' ? `${config.playerName} (Kaurava)` : `${config.opponentName} (Kaurava)`}
            isTurn={!isWhiteTurn}
          />
        </>
      ) : (
        <>
          <CapitalDisplay
            capital={playerCapital}
            playerName={config.playerName}
            isTurn={isWhiteTurn === (config.playerColor === 'w')}
          />
          <CapitalDisplay
            capital={opponentCapital}
            playerName={config.opponentName}
            isTurn={isWhiteTurn !== (config.playerColor === 'w')}
          />
        </>
      )}

      {phase === 'investment_prompt' && currentOpportunity && (
        <RiskOpportunity
          opportunity={currentOpportunity}
          availableCapital={
            turn === 'w' ? capitalBlack.available : capitalWhite.available
            // Note: The player who just moved is opposite of current turn!
          }
          onInvest={(amount) => handleInvestmentDecision(amount)}
          onSkip={() => handleInvestmentDecision(null)}
        />
      )}

      {currentInvestments.length > 0 && (
        <div>
          <div className="panel-section-header">Active Campaigns</div>
          <div className="active-investments">
            {currentInvestments.map((inv) => (
              <div key={inv.id} className="active-investment-item">
                <span className="active-investment-piece">
                  {inv.pieceColor === 'w' ? 'Pandava' : 'Kaurava'}{' '}
                  {inv.pieceType.toUpperCase()} on {inv.pieceSquare}
                </span>
                <span className="active-investment-amount font-mono">
                  {formatCurrency(inv.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bharat Codex ─── */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <button
          type="button"
          onClick={() => setCodexOpen((o) => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2) var(--space-3)',
            color: 'var(--color-accent)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          <span>📜 Bharat Codex</span>
          <span>{codexOpen ? '▲' : '▼'}</span>
        </button>

        {codexOpen && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {/* Historical insight */}
            <div
              style={{
                borderLeft: '2px solid var(--color-accent)',
                paddingLeft: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {insight}
            </div>

            {/* Piece name reference */}
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--space-2)',
              }}
            >
              Sena Parichaya — Forces
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {PIECE_CODEX.map((pc) => (
                <div
                  key={pc.symbol}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {pc.symbol}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>
                    {pc.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <p className="virtual-currency-notice">
          Treasury Reserves (TR) are fictional planning values for this strategy simulation.
        </p>
      </div>
    </aside>
  );
};
