import React from 'react';
import { useAppStore } from '../../store/app-store';
import { getWinRate, getAverageRiskLabel } from '../../engine/profiles';
import { formatCurrency } from '../../engine/piece-values';

interface ProfileScreenProps {
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { playerProfile } = useAppStore();

  if (!playerProfile) return null;

  const winRate = getWinRate(playerProfile);
  const riskLabel = getAverageRiskLabel(playerProfile.averageRiskLevel);

  return (
    <div className="profile-screen">
      <div className="profile-content">
        <header className="profile-header">
          <div className="capital-label" style={{ marginBottom: 4 }}>RAJA PARICHAYA — COMMANDER RECORD</div>
          <h1 className="profile-name">{playerProfile.name}</h1>
          <div className="profile-badge">{playerProfile.riskProfile}</div>
        </header>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{playerProfile.gamesPlayed}</span>
            <span className="profile-stat-label">Yuddha Samapti</span>
          </div>

          <div className="profile-stat">
            <span className="profile-stat-value">{winRate}%</span>
            <span className="profile-stat-label">Vijay Dar ({playerProfile.wins}W / {playerProfile.losses}L)</span>
          </div>

          <div className="profile-stat">
            <span className="profile-stat-value">{riskLabel}</span>
            <span className="profile-stat-label">Jokhim Kshamta</span>
          </div>

          <div className="profile-stat">
            <span
              className={`profile-stat-value ${
                playerProfile.investmentROI >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {playerProfile.investmentROI >= 0 ? '+' : ''}
              {playerProfile.investmentROI}%
            </span>
            <span className="profile-stat-label">Rajniti Prabhav</span>
          </div>
        </div>

        <div className="profile-description">
          <div className="capital-label" style={{ marginBottom: 4 }}>SHAILI MULYANKAN — STYLE ASSESSMENT</div>
          {playerProfile.profileDescription}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-xs)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <span className="text-secondary">Jeevankaal Kosh Nivesh</span>
          <span className="font-mono text-accent">{formatCurrency(playerProfile.totalInvested)}</span>
        </div>

        <button type="button" className="btn-secondary profile-back-btn" onClick={onBack}>
          Rajdarbar Vaapis ←
        </button>
      </div>
    </div>
  );
};
