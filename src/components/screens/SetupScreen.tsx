import React, { useState } from 'react';
import type { GameMode, GameConfig } from '../../engine/game-state';
import type { StockfishDifficulty } from '../../engine/stockfish-worker';
import type { Color } from 'chess.js';
import { useAppStore } from '../../store/app-store';
import { STARTING_CAPITAL } from '../../engine/piece-values';

interface SetupScreenProps {
  mode: GameMode;
  onStart: (config: GameConfig) => void;
  onBack: () => void;
}

// Bharat Codex Scenarios — cosmetic framing for SIH26208
const SCENARIOS = [
  {
    id: 'trade_route',
    title: 'The Grand Trade Route',
    subtitle: 'Silk & Spice',
    desc: 'Commerce flows across the board. High-value captures are tactically rewarded.',
  },
  {
    id: 'monsoon',
    title: 'The Monsoon',
    subtitle: 'Season of Uncertainty',
    desc: 'Volatile conditions. Risk profiles shift with each campaign decision.',
  },
  {
    id: 'nalanda',
    title: 'The Centre of Knowledge',
    subtitle: 'Nalanda Principles',
    desc: 'Defensive mastery is rewarded. Protect your pieces, strengthen your treasury.',
  },
] as const;

type ScenarioId = (typeof SCENARIOS)[number]['id'];

const MODE_TITLE: Record<GameMode, string> = {
  classic: 'Yuddha — War vs Engine',
  local: 'Sabha — Royal Court Duel',
  practice: 'Abhyas — Training Ground',
  tutorial: 'Gurukul',
  demo: 'Rajdarbar Demo',
};

export const SetupScreen: React.FC<SetupScreenProps> = ({ mode, onStart, onBack }) => {
  const { playerProfile } = useAppStore();
  const [difficulty, setDifficulty] = useState<StockfishDifficulty>('intermediate');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [playerName, setPlayerName] = useState(playerProfile?.name || 'Commander');
  const [opponentName, setOpponentName] = useState('Rival Commander');
  const [scenario, setScenario] = useState<ScenarioId>('trade_route');

  const handleStart = () => {
    const trimmedPlayer = playerName.trim();
    const trimmedOpponent = opponentName.trim();
    const config: GameConfig = {
      mode,
      difficulty,
      playerColor,
      playerName: trimmedPlayer || playerProfile?.name || 'Commander',
      opponentName: mode === 'local' ? (trimmedOpponent || 'Rival Commander') : 'AI Chakravartin',
      startingCapital: STARTING_CAPITAL,
    };
    onStart(config);
  };

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <h2 className="setup-title">
          {MODE_TITLE[mode]}
        </h2>

        {/* Scenario Selection */}
        <div className="setup-section">
          <div className="setup-label">Choose Your Campaign</div>
          <div className="setup-options">
            {SCENARIOS.map((s) => (
              <div
                key={s.id}
                className={`setup-option ${scenario === s.id ? 'setup-option--selected' : ''}`}
                onClick={() => setScenario(s.id)}
              >
                <div className="setup-option-dot" />
                <div>
                  <div className="setup-option-text">
                    {s.title}
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                      — {s.subtitle}
                    </span>
                  </div>
                  <div className="setup-option-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Difficulty — only for non-local modes */}
        {mode !== 'local' && (
          <div className="setup-section">
            <div className="setup-label">Engine Strength</div>
            <div className="setup-options">
              {(
                [
                  {
                    id: 'beginner',
                    title: 'Senapati — Commander',
                    desc: 'Learns from the field, occasional tactical lapses',
                  },
                  {
                    id: 'intermediate',
                    title: 'Maharathi — General',
                    desc: 'Sound strategic play with counter-threats',
                  },
                  {
                    id: 'advanced',
                    title: 'Chakravartin — Emperor',
                    desc: 'Uncompromising positional evaluation',
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.id}
                  className={`setup-option ${difficulty === item.id ? 'setup-option--selected' : ''}`}
                  onClick={() => setDifficulty(item.id)}
                >
                  <div className="setup-option-dot" />
                  <div>
                    <div className="setup-option-text">{item.title}</div>
                    <div className="setup-option-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side Selection */}
        <div className="setup-section">
          <div className="setup-label">Choose Your Side</div>
          <div className="setup-options" style={{ flexDirection: 'row', gap: 'var(--space-3)' }}>
            <div
              className={`setup-option ${playerColor === 'w' ? 'setup-option--selected' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setPlayerColor('w')}
            >
              <div className="setup-option-dot" />
              <div>
                <div className="setup-option-text">Pandava ♔</div>
                <div className="setup-option-desc">First move · White</div>
              </div>
            </div>

            <div
              className={`setup-option ${playerColor === 'b' ? 'setup-option--selected' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setPlayerColor('b')}
            >
              <div className="setup-option-dot" />
              <div>
                <div className="setup-option-text">Kaurava ♚</div>
                <div className="setup-option-desc">Counter-play · Black</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
            Cosmetic fiction only — both sides play by the same rules.
          </div>
        </div>

        {/* Local duel player names */}
        {mode === 'local' && (
          <div className="setup-section">
            <div className="setup-label">Royal Combatants</div>
            <div className="setup-input-group">
              <div className="setup-input-field">
                <label className="setup-input-label" htmlFor="player1-name">
                  Commander 1 ({playerColor === 'w' ? 'Pandava ♔' : 'Kaurava ♚'})
                </label>
                <input
                  id="player1-name"
                  type="text"
                  className="setup-input"
                  placeholder="Commander 1"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={24}
                />
              </div>

              <div className="setup-input-field">
                <label className="setup-input-label" htmlFor="opponent-name">
                  Commander 2 ({playerColor === 'w' ? 'Kaurava ♚' : 'Pandava ♔'})
                </label>
                <input
                  id="opponent-name"
                  type="text"
                  className="setup-input"
                  placeholder="Rival Commander"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  maxLength={24}
                />
              </div>
            </div>
          </div>
        )}

        <button type="button" className="btn-primary setup-start-btn" onClick={handleStart}>
          Declare War ⚔
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
          onClick={onBack}
        >
          Return to Rajdarbar
        </button>
      </div>
    </div>
  );
};
