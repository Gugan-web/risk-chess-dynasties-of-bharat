import type { Square, PieceSymbol, Color, Move } from 'chess.js';
import { ChessEngine } from './chess-engine';
import { getPieceValue, getPieceName } from './piece-values';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskAnalysis {
  capturedPiece: PieceSymbol;
  capturingPiece: PieceSymbol;
  captureSquare: Square;
  captureValue: number;
  capturingPieceValue: number;
  captureProbability: number;   // 0–100
  survivalProbability: number;  // 0–100
  opponentThreat: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReturn: number;       // Resource units
  riskLevel: RiskLevel;
  riskScore: number;            // 0–100 (100 = highest risk)
  description: string;
}

export interface InvestmentOpportunity {
  id: string;
  moveFrom: Square;
  moveTo: Square;
  analysis: RiskAnalysis;
  suggestedInvestments: number[];
  maxInvestment: number;
  potentialReturn: number;
  moveNumber: number;
}

let opportunityCounter = 0;

export function analyzeMove(
  engine: ChessEngine,
  from: Square,
  to: Square,
  move: Move
): RiskAnalysis | null {
  if (!move.captured) return null;

  const capturedPiece = move.captured as PieceSymbol;
  const capturingPiece = move.piece as PieceSymbol;
  const capturingColor = move.color as Color;
  const opponentColor: Color = capturingColor === 'w' ? 'b' : 'w';

  const captureValue = getPieceValue(capturedPiece);
  const capturingPieceValue = getPieceValue(capturingPiece);

  // After the move is made, check if the capturing piece is under attack
  const squareInfo = engine.getSquareInfo(to);
  const isAttackedByOpponent = opponentColor === 'w'
    ? squareInfo.isAttackedByWhite
    : squareInfo.isAttackedByBlack;

  // Calculate survival probability
  let survivalProbability: number;
  if (!isAttackedByOpponent) {
    survivalProbability = 95; // Very safe
  } else if (capturingPieceValue <= captureValue) {
    survivalProbability = 40; // Trading down or equal — risky but might be worth it
  } else {
    survivalProbability = 20; // Sacrificing higher value piece
  }

  // Capture probability is 100 since this is a legal capture move
  const captureProbability = 100;

  // Opponent threat assessment
  let opponentThreat: 'LOW' | 'MEDIUM' | 'HIGH';
  if (!isAttackedByOpponent) {
    opponentThreat = 'LOW';
  } else if (capturingPieceValue >= captureValue) {
    opponentThreat = 'HIGH';
  } else {
    opponentThreat = 'MEDIUM';
  }

  // Risk score (0-100, higher = riskier)
  let riskScore = 50; // baseline
  if (!isAttackedByOpponent) riskScore -= 30;
  if (isAttackedByOpponent && capturingPieceValue > captureValue) riskScore += 25;
  if (isAttackedByOpponent && capturingPieceValue <= captureValue) riskScore += 10;
  if (captureValue >= 1500) riskScore -= 10; // high value capture is generally good
  riskScore = Math.max(5, Math.min(95, riskScore));

  // Risk level
  let riskLevel: RiskLevel;
  if (riskScore <= 33) riskLevel = 'LOW';
  else if (riskScore <= 66) riskLevel = 'MEDIUM';
  else riskLevel = 'HIGH';

  // Expected return calculation
  const baseReturn = captureValue * 0.5;
  const riskMultiplier = riskScore / 50;
  const expectedReturn = Math.round(baseReturn * riskMultiplier * (survivalProbability / 100));

  // Description
  const desc = generateDescription(capturingPiece, capturedPiece, riskLevel, isAttackedByOpponent);

  return {
    capturedPiece,
    capturingPiece,
    captureSquare: to,
    captureValue,
    capturingPieceValue,
    captureProbability,
    survivalProbability,
    opponentThreat,
    expectedReturn,
    riskLevel,
    riskScore,
    description: desc,
  };
}

export function createInvestmentOpportunity(
  analysis: RiskAnalysis,
  from: Square,
  to: Square,
  availableCapital: number,
  moveNumber: number,
  presets: readonly number[]
): InvestmentOpportunity {
  const maxInvestment = Math.min(availableCapital, analysis.captureValue);
  const suggestedInvestments = presets.filter((p) => p <= availableCapital);

  // Potential return scales with risk
  const returnMultiplier = analysis.riskScore <= 33 ? 0.3 : analysis.riskScore <= 66 ? 0.6 : 1.0;
  const potentialReturn = Math.round(suggestedInvestments[suggestedInvestments.length - 1] * returnMultiplier * 1.5 || 0);

  return {
    id: `opp_${++opportunityCounter}_${Date.now()}`,
    moveFrom: from,
    moveTo: to,
    analysis,
    suggestedInvestments,
    maxInvestment,
    potentialReturn,
    moveNumber,
  };
}

export function shouldOfferInvestment(
  move: Move,
  moveNumber: number,
  lastInvestmentMove: number
): boolean {
  // Don't offer on every single move — only on captures and periodically
  if (!move.captured) return false;

  // Don't offer two investments in a row
  if (moveNumber - lastInvestmentMove < 2) return false;

  // Always offer on high-value captures
  const capturedValue = getPieceValue(move.captured as PieceSymbol);
  if (capturedValue >= 1000) return true;

  // For lower-value captures, offer ~60% of the time
  return Math.random() > 0.4;
}

export function calculateReturn(
  investedAmount: number,
  analysis: RiskAnalysis,
  pieceSurvived: boolean
): { success: boolean; returnAmount: number; description: string } {
  if (pieceSurvived) {
    // Success impact scales with risk level — matches estimated upside exactly
    const returnAmount = calculatePotentialGain(investedAmount, analysis.riskLevel);

    return {
      success: true,
      returnAmount,
      description: `Your ${getPieceName(analysis.capturingPiece)} survived. Assignment created +${returnAmount} RU operational impact.`,
    };
  } else {
    // Failure — write down a portion of the committed resources — matches estimated deduction exactly
    const lostAmount = calculatePotentialLoss(investedAmount, analysis.riskLevel);

    return {
      success: false,
      returnAmount: -lostAmount,
      description: `Your ${getPieceName(analysis.capturingPiece)} was captured. ${lostAmount} RU was written down from the assignment.`,
    };
  }
}

export function calculatePotentialGain(investedAmount: number, riskLevel: RiskLevel): number {
  return Math.round(investedAmount * getSuccessMultiplier(riskLevel));
}

export function calculatePotentialLoss(investedAmount: number, riskLevel: RiskLevel): number {
  return Math.round(investedAmount * getLossRate(riskLevel));
}

export function calculateExpectedReturn(
  investedAmount: number,
  analysis: Pick<RiskAnalysis, 'riskLevel' | 'survivalProbability'>
): number {
  const survivalRate = analysis.survivalProbability / 100;
  const expectedGain = calculatePotentialGain(investedAmount, analysis.riskLevel);
  const expectedLoss = calculatePotentialLoss(investedAmount, analysis.riskLevel);

  return Math.round((survivalRate * expectedGain) - ((1 - survivalRate) * expectedLoss));
}

export function getSuccessMultiplier(riskLevel: RiskLevel): number {
  if (riskLevel === 'LOW') return 0.25;
  if (riskLevel === 'MEDIUM') return 0.55;
  return 0.9;
}

export function getLossRate(riskLevel: RiskLevel): number {
  if (riskLevel === 'HIGH') return 0.8;
  if (riskLevel === 'MEDIUM') return 0.5;
  return 0.3;
}

function generateDescription(
  attacker: PieceSymbol,
  target: PieceSymbol,
  risk: RiskLevel,
  counterAttackPossible: boolean
): string {
  const attackerName = getPieceName(attacker);
  const targetName = getPieceName(target);

  if (risk === 'LOW') {
    return `Your ${attackerName} captures the ${targetName} with minimal counter-threat.`;
  }
  if (risk === 'MEDIUM') {
    if (counterAttackPossible) {
      return `Your ${attackerName} takes the ${targetName}, but faces possible retaliation.`;
    }
    return `Your ${attackerName} captures the ${targetName} in a contested position.`;
  }
  return `Your ${attackerName} attacks the ${targetName} in a dangerous position — high counter-attack risk.`;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'var(--color-success)';
    case 'MEDIUM': return 'var(--color-accent)';
    case 'HIGH': return 'var(--color-danger)';
  }
}

export function getRiskLabel(score: number): string {
  if (score <= 20) return 'Very Low';
  if (score <= 40) return 'Low';
  if (score <= 55) return 'Medium';
  if (score <= 75) return 'Medium-High';
  return 'High';
}
