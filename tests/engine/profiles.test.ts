import { describe, it, expect } from 'vitest';
import {
  createPlayerProfile,
  deriveRiskProfile,
  updateProfileAfterGame,
  getWinRate,
} from '../../src/engine/profiles';
import { createInvestmentHistory } from '../../src/engine/investment';

describe('Player Profiles', () => {
  it('creates an initialized profile for new player', () => {
    const profile = createPlayerProfile('Gugan');
    expect(profile.name).toBe('Gugan');
    expect(profile.gamesPlayed).toBe(0);
    expect(profile.riskProfile).toBe('Newcomer');
    expect(getWinRate(profile)).toBe(0);
  });

  it('classifies Conservative Strategist when risk is low and win rate is high', () => {
    const result = deriveRiskProfile(25, 20, 5, 75);
    expect(result.profile).toBe('Conservative Strategist');
    expect(result.description).toContain('safe');
  });

  it('classifies Aggressive Opportunist when risk appetite is high', () => {
    const result = deriveRiskProfile(75, 15, 6, 50);
    expect(result.profile).toBe('Aggressive Opportunist');
    expect(result.description).toContain('high-risk');
  });

  it('classifies Calculated Risk Taker for balanced, medium-risk decisions', () => {
    const result = deriveRiskProfile(50, 18, 8, 65);
    expect(result.profile).toBe('Calculated Risk Taker');
    expect(result.description).toContain('balance');
  });

  it('updates profile statistics cumulatively after a match', () => {
    const profile = createPlayerProfile('Alex');
    const history = createInvestmentHistory();
    history.totalInvested = 1500;
    history.totalReturned = 2200;
    history.successCount = 2;
    history.failureCount = 1;

    const updated = updateProfileAfterGame(profile, true, false, history, 45);

    expect(updated.gamesPlayed).toBe(1);
    expect(updated.wins).toBe(1);
    expect(updated.totalInvested).toBe(1500);
    expect(updated.totalReturned).toBe(2200);
    expect(getWinRate(updated)).toBe(100);
  });
});
