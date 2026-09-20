import type { PieceSymbol, Color } from 'chess.js';
import { getPieceValue, STARTING_CAPITAL, formatCurrency } from './piece-values';

export interface Transaction {
  id: string;
  type:
    | 'capture_gain'
    | 'capture_loss'
    | 'investment'
    | 'investment_return'
    | 'investment_loss'
    | 'match_settlement_gain'
    | 'match_settlement_loss';
  amount: number;
  description: string;
  timestamp: number;
  moveNumber: number;
}

export interface CapitalState {
  total: number;
  available: number;
  invested: number;
  transactions: Transaction[];
  materialGained: number;
  materialLost: number;
}

export function createCapitalState(startingCapital: number = STARTING_CAPITAL): CapitalState {
  return {
    total: startingCapital,
    available: startingCapital,
    invested: 0,
    transactions: [],
    materialGained: 0,
    materialLost: 0,
  };
}

let txCounter = 0;
function nextTxId(): string {
  return `tx_${Date.now()}_${++txCounter}`;
}

export function onCapture(
  state: CapitalState,
  capturedPiece: PieceSymbol,
  capturedByUs: boolean,
  moveNumber: number
): CapitalState {
  const value = getPieceValue(capturedPiece);
  if (value === 0) return state; // King has no material value

  if (capturedByUs) {
    return {
      ...state,
      total: state.total + value,
      available: state.available + value,
      materialGained: state.materialGained + value,
      transactions: [
        ...state.transactions,
        {
          id: nextTxId(),
          type: 'capture_gain',
          amount: value,
          description: `Captured opponent asset (+${formatCurrency(value)})`,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    };
  } else {
    return {
      ...state,
      total: state.total - value,
      available: state.available - value,
      materialLost: state.materialLost + value,
      transactions: [
        ...state.transactions,
        {
          id: nextTxId(),
          type: 'capture_loss',
          amount: -value,
          description: `Conceded a piece (-${formatCurrency(value)})`,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    };
  }
}

export function makeInvestment(
  state: CapitalState,
  amount: number,
  description: string,
  moveNumber: number
): CapitalState | null {
  if (amount <= 0 || amount > state.available) return null;

  return {
    ...state,
    available: state.available - amount,
    invested: state.invested + amount,
    transactions: [
      ...state.transactions,
      {
        id: nextTxId(),
        type: 'investment',
        amount: -amount,
        description,
        timestamp: Date.now(),
        moveNumber,
      },
    ],
  };
}

export function resolveInvestment(
  state: CapitalState,
  investedAmount: number,
  returnAmount: number,
  success: boolean,
  description: string,
  moveNumber: number
): CapitalState {
  if (success) {
    return {
      ...state,
      total: state.total + returnAmount,
      available: state.available + investedAmount + returnAmount,
      invested: state.invested - investedAmount,
      transactions: [
        ...state.transactions,
        {
          id: nextTxId(),
          type: 'investment_return',
          amount: returnAmount,
          description,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    };
  } else {
    const actualLoss = Math.min(Math.abs(returnAmount) || investedAmount, investedAmount);
    const refund = investedAmount - actualLoss;
    return {
      ...state,
      total: state.total - actualLoss,
      available: state.available + refund,
      invested: state.invested - investedAmount,
      transactions: [
        ...state.transactions,
        {
          id: nextTxId(),
          type: 'investment_loss',
          amount: -actualLoss,
          description,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    };
  }
}

export function settleMatchResources(
  winnerState: CapitalState,
  loserState: CapitalState,
  startingResources: number,
  moveNumber: number
): { winnerState: CapitalState; loserState: CapitalState; settlementAmount: number } {
  const winnerBehind = winnerState.total < loserState.total;
  const loserEarnedResources = Math.max(0, loserState.total - startingResources);
  const settlementAmount = winnerBehind ? Math.floor(loserEarnedResources * 0.5) : 0;

  if (settlementAmount <= 0) {
    return { winnerState, loserState, settlementAmount: 0 };
  }

  return {
    winnerState: {
      ...winnerState,
      total: winnerState.total + settlementAmount,
      available: winnerState.available + settlementAmount,
      transactions: [
        ...winnerState.transactions,
        {
          id: nextTxId(),
          type: 'match_settlement_gain',
          amount: settlementAmount,
          description: `Post-match executive settlement (+${formatCurrency(settlementAmount)})`,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    },
    loserState: {
      ...loserState,
      total: loserState.total - settlementAmount,
      available: loserState.available - settlementAmount,
      transactions: [
        ...loserState.transactions,
        {
          id: nextTxId(),
          type: 'match_settlement_loss',
          amount: -settlementAmount,
          description: `Post-match executive settlement (-${formatCurrency(settlementAmount)})`,
          timestamp: Date.now(),
          moveNumber,
        },
      ],
    },
    settlementAmount,
  };
}

export function canAfford(state: CapitalState, amount: number): boolean {
  return state.available >= amount;
}

export function getInvestmentROI(state: CapitalState): number {
  const totalInvested = state.transactions
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalReturns = state.transactions
    .filter((t) => t.type === 'investment_return')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLosses = state.transactions
    .filter((t) => t.type === 'investment_loss')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (totalInvested === 0) return 0;
  return ((totalReturns - totalLosses) / totalInvested) * 100;
}
