import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';

interface NameScreenProps {
  onComplete: () => void;
}

export const NameScreen: React.FC<NameScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const { initializePlayer } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    initializePlayer(trimmed);
    onComplete();
  };

  return (
    <div className="name-screen">
      <div className="name-content">
        {/* Chakra emblem */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
          <svg width="36" height="36" viewBox="0 0 45 45" fill="none" aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            <circle cx="22.5" cy="22" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="22.5" cy="22" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 22.5 + 4.5 * Math.cos(rad);
              const y1 = 22 + 4.5 * Math.sin(rad);
              const x2 = 22.5 + 17 * Math.cos(rad);
              const y2 = 22 + 17 * Math.sin(rad);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />;
            })}
          </svg>
        </div>

        <h1 className="name-title">Dynasties of Bharat</h1>
        <p className="name-subtitle">
          A royal strategy simulation inspired by Indian civilisation.<br />
          Enter your commander's title to begin your campaign.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="name-input"
            placeholder="Your Royal Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoFocus
            required
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={!name.trim()}
          >
            Enter the Rajdarbar ⚔
          </button>
        </form>

        <p className="virtual-currency-notice" style={{ marginTop: 'var(--space-8)' }}>
          Treasury Reserves (TR) are fictional planning values. No real currency or financial transactions are involved.
          SIH26208 submission.
        </p>
      </div>
    </div>
  );
};
