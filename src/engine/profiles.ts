import type { InvestmentHistory } from './investment';

export type RiskProfile =
  | 'Calculated Risk Taker'
  | 'Conservative Strategist'
  | 'Aggressive Opportunist'
  | 'Adaptive Player'
  | 'Newcomer';

export interface PlayerProfile {
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalInvested: number;
  totalReturned: number;
  averageRiskLevel: number; // 0-100
  riskProfile: RiskProfile;
  profileDescription: string;
  investmentROI: number;
  createdAt: number;
  updatedAt: number;
}

export function createPlayerProfile(name: string): PlayerProfile {
  return {
    name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalInvested: 0,
    totalReturned: 0,
    averageRiskLevel: 50,
    riskProfile: 'Newcomer',
    profileDescription: 'Play a few games to discover your decision style.',
    investmentROI: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function deriveRiskProfile(
  avgRisk: number,
  investmentROI: number,
  investmentCount: number,
  successRate: number
): { profile: RiskProfile; description: string } {
  if (investmentCount < 3) {
    return {
      profile: 'Newcomer',
      description: 'Play a few more games to discover your decision style.',
    };
  }

  if (avgRisk < 35 && successRate > 60) {
    return {
      profile: 'Conservative Strategist',
      description:
        'You prefer safe, well-calculated positions. Your commitments focus on low-risk assignments with reliable operational impact.',
    };
  }

  if (avgRisk > 65 && investmentROI > 0) {
    return {
      profile: 'Aggressive Opportunist',
      description:
        'You embrace high-risk, high-exposure situations. When you see an opening, you commit substantial resources despite the operational danger.',
    };
  }

  if (avgRisk >= 35 && avgRisk <= 65 && successRate > 50) {
    return {
      profile: 'Calculated Risk Taker',
      description:
        'You balance exposure and upside effectively. You approve medium-risk assignments and avoid both extremes.',
    };
  }

  return {
    profile: 'Adaptive Player',
    description:
      'Your decision style varies based on the position. You adjust your risk tolerance to match the board situation.',
  };
}

export function updateProfileAfterGame(
  profile: PlayerProfile,
  won: boolean,
  drew: boolean,
  investmentHistory: InvestmentHistory,
  avgRisk: number
): PlayerProfile {
  const newGamesPlayed = profile.gamesPlayed + 1;
  const newWins = profile.wins + (won ? 1 : 0);
  const newLosses = profile.losses + (!won && !drew ? 1 : 0);
  const newDraws = profile.draws + (drew ? 1 : 0);
  const newTotalInvested = profile.totalInvested + investmentHistory.totalInvested;
  const newTotalReturned = profile.totalReturned + investmentHistory.totalReturned;
  const newROI =
    newTotalInvested > 0
      ? Math.round(
          ((newTotalReturned - (investmentHistory.totalLost + profile.totalInvested - profile.totalReturned)) /
            Math.max(1, newTotalInvested)) *
            1000
        ) / 10
      : 0;

  // Rolling average risk
  const newAvgRisk = Math.round(
    (profile.averageRiskLevel * profile.gamesPlayed + avgRisk) / newGamesPlayed
  );

  const totalInvestments =
    investmentHistory.successCount + investmentHistory.failureCount;
  const { profile: riskProfile, description } = deriveRiskProfile(
    newAvgRisk,
    newROI,
    totalInvestments,
    totalInvestments > 0
      ? (investmentHistory.successCount / totalInvestments) * 100
      : 0
  );

  return {
    ...profile,
    gamesPlayed: newGamesPlayed,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    totalInvested: newTotalInvested,
    totalReturned: newTotalReturned,
    averageRiskLevel: newAvgRisk,
    riskProfile,
    profileDescription: description,
    investmentROI: newROI,
    updatedAt: Date.now(),
  };
}

export function getWinRate(profile: PlayerProfile): number {
  if (profile.gamesPlayed === 0) return 0;
  return Math.round((profile.wins / profile.gamesPlayed) * 100);
}

export function getAverageRiskLabel(score: number): string {
  if (score < 30) return 'LOW';
  if (score < 60) return 'MEDIUM';
  return 'HIGH';
}
