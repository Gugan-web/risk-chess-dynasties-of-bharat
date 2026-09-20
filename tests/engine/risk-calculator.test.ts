import { describe, it, expect } from 'vitest';
import { ChessEngine } from '../../src/engine/chess-engine';
import {
  analyzeMove,
  createInvestmentOpportunity,
  shouldOfferInvestment,
  calculateReturn,
  calculateExpectedReturn,
  getRiskLabel,
} from '../../src/engine/risk-calculator';
import { INVESTMENT_PRESETS } from '../../src/engine/piece-values';

describe('Risk Calculator', () => {
  it('analyzes captures and computes survival probability and threat', () => {
    const engine = new ChessEngine();
    // Setup capture: e4, d5, exd5
    engine.makeMove('e2', 'e4');
    engine.makeMove('d7', 'd5');
    const captureResult = engine.makeMove('e4', 'd5');

    expect(captureResult?.move.captured).toBe('p');
    const analysis = analyzeMove(engine, 'e4', 'd5', captureResult!.move);

    expect(analysis).not.toBeNull();
    expect(analysis?.captureValue).toBe(500); // Pawn value
    expect(analysis?.captureProbability).toBe(100);
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(analysis?.riskLevel);
    expect(analysis?.expectedReturn).toBeGreaterThanOrEqual(0);
  });

  it('generates investment opportunities with preset allocations', () => {
    const engine = new ChessEngine();
    engine.makeMove('e2', 'e4');
    engine.makeMove('d7', 'd5');
    const captureResult = engine.makeMove('e4', 'd5');
    const analysis = analyzeMove(engine, 'e4', 'd5', captureResult!.move)!;

    const opp = createInvestmentOpportunity(analysis, 'e4', 'd5', 10000, 2, INVESTMENT_PRESETS);

    expect(opp).toBeDefined();
    expect(opp.suggestedInvestments).toEqual([100, 250, 500, 1000]);
    expect(opp.potentialReturn).toBeGreaterThan(0);
  });

  it('filters presets when available capital is low', () => {
    const engine = new ChessEngine();
    engine.makeMove('e2', 'e4');
    engine.makeMove('d7', 'd5');
    const captureResult = engine.makeMove('e4', 'd5');
    const analysis = analyzeMove(engine, 'e4', 'd5', captureResult!.move)!;

    const opp = createInvestmentOpportunity(analysis, 'e4', 'd5', 300, 2, INVESTMENT_PRESETS);
    expect(opp.suggestedInvestments).toEqual([100, 250]);
  });

  it('calculates returns on survival', () => {
    const analysis = {
      capturedPiece: 'q' as const,
      capturingPiece: 'n' as const,
      captureSquare: 'd8' as const,
      captureValue: 3000,
      capturingPieceValue: 1000,
      captureProbability: 100,
      survivalProbability: 75,
      opponentThreat: 'LOW' as const,
      expectedReturn: 800,
      riskLevel: 'LOW' as const,
      riskScore: 25,
      description: 'Test',
    };

    const outcome = calculateReturn(500, analysis, true);
    expect(outcome.success).toBe(true);
    expect(outcome.returnAmount).toBeGreaterThan(0);
  });

  it('calculates expected return from the selected investment amount', () => {
    const analysis = {
      capturedPiece: 'p' as const,
      capturingPiece: 'n' as const,
      captureSquare: 'e5' as const,
      captureValue: 500,
      capturingPieceValue: 1000,
      captureProbability: 100,
      survivalProbability: 40,
      opponentThreat: 'MEDIUM' as const,
      expectedReturn: 200,
      riskLevel: 'MEDIUM' as const,
      riskScore: 60,
      description: 'Medium risk trade',
    };

    expect(calculateExpectedReturn(100, analysis)).toBe(-8);
    expect(calculateExpectedReturn(500, analysis)).toBe(-40);
    expect(calculateExpectedReturn(1000, analysis)).toBe(-80);
  });

  it('calculates loss when piece is lost', () => {
    const analysis = {
      capturedPiece: 'p' as const,
      capturingPiece: 'q' as const,
      captureSquare: 'e5' as const,
      captureValue: 500,
      capturingPieceValue: 3000,
      captureProbability: 100,
      survivalProbability: 20,
      opponentThreat: 'HIGH' as const,
      expectedReturn: 200,
      riskLevel: 'HIGH' as const,
      riskScore: 80,
      description: 'High risk sacrifice',
    };

    const outcome = calculateReturn(1000, analysis, false);
    expect(outcome.success).toBe(false);
    expect(outcome.returnAmount).toBeLessThan(0);
  });

  it('maps risk scores to verbal labels', () => {
    expect(getRiskLabel(10)).toBe('Very Low');
    expect(getRiskLabel(35)).toBe('Low');
    expect(getRiskLabel(50)).toBe('Medium');
    expect(getRiskLabel(70)).toBe('Medium-High');
    expect(getRiskLabel(90)).toBe('High');
  });
});
