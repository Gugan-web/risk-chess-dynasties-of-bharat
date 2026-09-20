import { describe, it, expect } from 'vitest';
import {
  createCapitalState,
  onCapture,
  makeInvestment,
  resolveInvestment,
  settleMatchResources,
  canAfford,
  getInvestmentROI,
} from '../../src/engine/capital';

describe('Capital System', () => {
  it('initializes with default starting capital', () => {
    const capital = createCapitalState(10000);
    expect(capital.total).toBe(10000);
    expect(capital.available).toBe(10000);
    expect(capital.invested).toBe(0);
    expect(capital.materialGained).toBe(0);
    expect(capital.materialLost).toBe(0);
  });

  it('credits valuation when capturing an opponent piece', () => {
    let state = createCapitalState(10000);
    // Capturing a Queen (value: 3000)
    state = onCapture(state, 'q', true, 1);
    expect(state.total).toBe(13000);
    expect(state.available).toBe(13000);
    expect(state.materialGained).toBe(3000);
    expect(state.transactions.length).toBe(1);
    expect(state.transactions[0].type).toBe('capture_gain');
  });

  it('debits valuation when losing a piece to opponent', () => {
    let state = createCapitalState(10000);
    // Losing a Rook (value: 1500)
    state = onCapture(state, 'r', false, 2);
    expect(state.total).toBe(8500);
    expect(state.available).toBe(8500);
    expect(state.materialLost).toBe(1500);
    expect(state.transactions[0].type).toBe('capture_loss');
  });

  it('allows valid investment allocation', () => {
    const state = createCapitalState(10000);
    const investedState = makeInvestment(state, 500, 'Knight tactical investment', 3);

    expect(investedState).not.toBeNull();
    expect(investedState?.total).toBe(10000);
    expect(investedState?.available).toBe(9500);
    expect(investedState?.invested).toBe(500);
    expect(investedState?.transactions.length).toBe(1);
  });

  it('prevents investment exceeding available capital', () => {
    const state = createCapitalState(500);
    const result = makeInvestment(state, 1000, 'Over-budget investment', 1);
    expect(result).toBeNull();
  });

  it('correctly credits returns on successful investment resolution', () => {
    let state = createCapitalState(10000);
    state = makeInvestment(state, 500, 'Tactical Knight', 1)!;
    state = resolveInvestment(state, 500, 350, true, 'Knight survived', 4);

    expect(state.total).toBe(10350);
    expect(state.available).toBe(10350);
    expect(state.invested).toBe(0);
    expect(getInvestmentROI(state)).toBe(70); // (350 / 500) * 100
  });

  it('correctly records losses on failed investment resolution', () => {
    let state = createCapitalState(10000);
    state = makeInvestment(state, 500, 'Tactical Knight', 1)!;
    state = resolveInvestment(state, 500, 250, false, 'Knight captured', 2);

    expect(state.total).toBe(9750);
    expect(state.available).toBe(9750);
    expect(state.invested).toBe(0);
  });

  it('settles 50% of loser earned resources when the match winner has fewer resources', () => {
    const winner = {
      ...createCapitalState(10000),
      total: 9000,
      available: 9000,
    };
    const loser = {
      ...createCapitalState(10000),
      total: 14000,
      available: 14000,
    };

    const result = settleMatchResources(winner, loser, 10000, 12);

    expect(result.settlementAmount).toBe(2000);
    expect(result.winnerState.total).toBe(11000);
    expect(result.loserState.total).toBe(12000);
    expect(result.winnerState.transactions.at(-1)?.type).toBe('match_settlement_gain');
    expect(result.loserState.transactions.at(-1)?.type).toBe('match_settlement_loss');
  });

  it('does not settle resources when the match winner already has equal or higher resources', () => {
    const winner = {
      ...createCapitalState(10000),
      total: 13000,
      available: 13000,
    };
    const loser = {
      ...createCapitalState(10000),
      total: 12000,
      available: 12000,
    };

    const result = settleMatchResources(winner, loser, 10000, 12);

    expect(result.settlementAmount).toBe(0);
    expect(result.winnerState.total).toBe(13000);
    expect(result.loserState.total).toBe(12000);
  });

  it('does not settle resources when the lower-resource loser has no earned surplus', () => {
    const winner = {
      ...createCapitalState(10000),
      total: 8500,
      available: 8500,
    };
    const loser = {
      ...createCapitalState(10000),
      total: 9500,
      available: 9500,
    };

    const result = settleMatchResources(winner, loser, 10000, 12);

    expect(result.settlementAmount).toBe(0);
    expect(result.winnerState.total).toBe(8500);
    expect(result.loserState.total).toBe(9500);
  });
});
