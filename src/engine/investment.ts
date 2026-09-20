import type { PieceSymbol, Color, Square } from 'chess.js';
import type { CapitalState, Transaction } from './capital';
import type { RiskAnalysis, InvestmentOpportunity } from './risk-calculator';

export type InvestmentStatus = 'active' | 'resolved_success' | 'resolved_failure';

export interface ActiveInvestment {
  id: string;
  pieceType: PieceSymbol;
  pieceSquare: Square;
  pieceColor: Color;
  amount: number;
  opportunity: InvestmentOpportunity;
  status: InvestmentStatus;
  returnAmount?: number;
  resolvedAtMove?: number;
  timestamp: number;
}

export interface InvestmentHistory {
  investments: ActiveInvestment[];
  totalInvested: number;
  totalReturned: number;
  totalLost: number;
  successCount: number;
  failureCount: number;
}

export function createInvestmentHistory(): InvestmentHistory {
  return {
    investments: [],
    totalInvested: 0,
    totalReturned: 0,
    totalLost: 0,
    successCount: 0,
    failureCount: 0,
  };
}

export function addInvestment(
  history: InvestmentHistory,
  investment: ActiveInvestment
): InvestmentHistory {
  return {
    ...history,
    investments: [...history.investments, investment],
    totalInvested: history.totalInvested + investment.amount,
  };
}

export function resolveInvestmentInHistory(
  history: InvestmentHistory,
  investmentId: string,
  success: boolean,
  returnAmount: number,
  moveNumber: number
): InvestmentHistory {
  const investments = history.investments.map((inv) => {
    if (inv.id !== investmentId) return inv;
    return {
      ...inv,
      status: (success ? 'resolved_success' : 'resolved_failure') as InvestmentStatus,
      returnAmount,
      resolvedAtMove: moveNumber,
    };
  });

  return {
    investments,
    totalInvested: history.totalInvested,
    totalReturned: success ? history.totalReturned + returnAmount : history.totalReturned,
    totalLost: !success ? history.totalLost + Math.abs(returnAmount) : history.totalLost,
    successCount: success ? history.successCount + 1 : history.successCount,
    failureCount: !success ? history.failureCount + 1 : history.failureCount,
  };
}

export function moveActiveInvestment(
  history: InvestmentHistory,
  from: Square,
  to: Square,
  pieceColor: Color,
  pieceType: PieceSymbol,
  promotedTo?: PieceSymbol
): InvestmentHistory {
  let changed = false;
  const investments = history.investments.map((inv) => {
    if (
      inv.status !== 'active' ||
      inv.pieceColor !== pieceColor ||
      inv.pieceSquare !== from ||
      inv.pieceType !== pieceType
    ) {
      return inv;
    }

    changed = true;
    return {
      ...inv,
      pieceSquare: to,
      pieceType: promotedTo ?? inv.pieceType,
    };
  });

  if (!changed) return history;

  return {
    ...history,
    investments,
  };
}

export function getActiveInvestments(history: InvestmentHistory): ActiveInvestment[] {
  return history.investments.filter((inv) => inv.status === 'active');
}

export function getInvestmentSuccessRate(history: InvestmentHistory): number {
  const total = history.successCount + history.failureCount;
  if (total === 0) return 0;
  return Math.round((history.successCount / total) * 100);
}

export function isPieceInvested(history: InvestmentHistory, square: Square): boolean {
  return history.investments.some(
    (inv) => inv.status === 'active' && inv.pieceSquare === square
  );
}

export function updateInvestmentPieceSquare(
  history: InvestmentHistory,
  from: Square,
  to: Square,
  pieceColor: Color
): InvestmentHistory {
  let changed = false;
  const investments = history.investments.map((inv) => {
    if (inv.status === 'active' && inv.pieceColor === pieceColor && inv.pieceSquare === from) {
      changed = true;
      return { ...inv, pieceSquare: to };
    }
    return inv;
  });
  return changed ? { ...history, investments } : history;
}
