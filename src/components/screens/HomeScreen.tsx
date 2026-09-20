import React from 'react';
import type { GameMode } from '../../engine/game-state';
import { useAppStore } from '../../store/app-store';

interface HomeScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMode,
  onOpenProfile,
}) => {
  const { playerProfile } = useAppStore();

  return (
    <main className="home-screen">
      <div className="home-bg" />

      <div className="home-content">
        <section className="home-brand" aria-label="Risk Chess: Dynasties of Bharat">
          <div className="home-logo">
            {/* Stylised Dharma Chakra / Crown emblem */}
            <svg width="42" height="42" viewBox="0 0 45 45" fill="none" aria-hidden="true">
              {/* Outer ring */}
              <circle cx="22.5" cy="22" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
              {/* Inner hub */}
              <circle cx="22.5" cy="22" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              {/* 8 spokes — Ashoka Chakra */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 22.5 + 4.5 * Math.cos(rad);
                const y1 = 22 + 4.5 * Math.sin(rad);
                const x2 = 22.5 + 17 * Math.cos(rad);
                const y2 = 22 + 17 * Math.sin(rad);
                return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />;
              })}
              {/* Crown peak */}
              <path
                d="M 17,10 L 22.5,5 L 28,10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h1 className="home-title">
            DYNASTIES<br />
            <span className="home-title-accent">OF BHARAT</span>
          </h1>
          <p className="home-subtitle">
            A royal strategy simulation where every conquest shapes your treasury.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', lineHeight: 1.5 }}>
            Risk Chess · SIH26208
          </p>
        </section>

        <nav className="home-menu" aria-label="Game Modes">
          <button
            type="button"
            className="home-menu-btn"
            onClick={() => onSelectMode('classic')}
          >
            <span className="home-menu-btn-icon">⚔</span>
            <div className="home-menu-btn-text">
              <div>Yuddha — War vs Engine</div>
              <span className="home-menu-btn-sub">Single combat against adaptive AI</span>
            </div>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => onSelectMode('local')}
          >
            <span className="home-menu-btn-icon">♚</span>
            <div className="home-menu-btn-text">
              <div>Sabha — Royal Court Duel</div>
              <span className="home-menu-btn-sub">Two commanders, separate treasuries</span>
            </div>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => onSelectMode('demo')}
          >
            <span className="home-menu-btn-icon">◆</span>
            <div className="home-menu-btn-text">
              <div>Rajdarbar — Judge Showcase</div>
              <span className="home-menu-btn-sub">60-second SIH26208 demonstration</span>
            </div>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => onSelectMode('tutorial')}
          >
            <span className="home-menu-btn-icon">॰</span>
            <div className="home-menu-btn-text">
              <div>Gurukul — Learn the Game</div>
              <span className="home-menu-btn-sub">Guided walkthrough of all mechanics</span>
            </div>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => onSelectMode('practice')}
          >
            <span className="home-menu-btn-icon">◎</span>
            <div className="home-menu-btn-text">
              <div>Abhyas — Training Ground</div>
              <span className="home-menu-btn-sub">Low-stakes tactical practice</span>
            </div>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={onOpenProfile}
          >
            <span className="home-menu-btn-icon">◉</span>
            <div className="home-menu-btn-text">
              <div>Raja Parichaya — Commander Profile</div>
              <span className="home-menu-btn-sub">
                {playerProfile?.name || 'View Record'} · {playerProfile?.riskProfile || 'Profile'}
              </span>
            </div>
          </button>
        </nav>
      </div>

      <p className="home-disclaimer">
        Treasury Reserves (TR) are fictional planning values for a closed strategy simulation. No real currency involved.
      </p>
    </main>
  );
};
