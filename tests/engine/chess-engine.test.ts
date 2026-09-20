import { describe, it, expect } from 'vitest';
import { ChessEngine } from '../../src/engine/chess-engine';

describe('ChessEngine', () => {
  it('initializes standard starting position', () => {
    const engine = new ChessEngine();
    const pos = engine.getPosition();

    expect(pos.turn).toBe('w');
    expect(pos.isCheck).toBe(false);
    expect(pos.isGameOver).toBe(false);
    expect(pos.moveNumber).toBe(1);
  });

  it('generates 20 legal opening moves for White', () => {
    const engine = new ChessEngine();
    const legalMoves = engine.getLegalMoves();
    expect(legalMoves.length).toBe(20);
  });

  it('executes legal move and updates turn', () => {
    const engine = new ChessEngine();
    const result = engine.makeMove('e2', 'e4');

    expect(result).not.toBeNull();
    expect(engine.getTurn()).toBe('b');
    expect(result?.move.san).toBe('e4');
  });

  it('rejects illegal moves', () => {
    const engine = new ChessEngine();
    const result = engine.makeMove('e2', 'e5');
    expect(result).toBeNull();
  });

  it('detects checkmate scenario (Fool’s Mate)', () => {
    const engine = new ChessEngine();
    engine.makeMove('f2', 'f3');
    engine.makeMove('e7', 'e5');
    engine.makeMove('g2', 'g4');
    const finalMove = engine.makeMove('d8', 'h4');

    expect(finalMove).not.toBeNull();
    const pos = engine.getPosition();
    expect(pos.isCheck).toBe(true);
    expect(pos.isCheckmate).toBe(true);
    expect(pos.isGameOver).toBe(true);
  });

  it('tracks captured pieces on tactical exchanges', () => {
    const engine = new ChessEngine();
    engine.makeMove('e2', 'e4');
    engine.makeMove('d7', 'd5');
    const captureResult = engine.makeMove('e4', 'd5');

    expect(captureResult?.capture).not.toBeNull();
    expect(captureResult?.capture?.capturedPiece).toBe('p');
    expect(captureResult?.capture?.capturingPiece).toBe('p');

    const captured = engine.getCapturedPieces();
    expect(captured.black).toContain('p');
  });

  it('handles undo correctly', () => {
    const engine = new ChessEngine();
    engine.makeMove('e2', 'e4');
    engine.undo();
    expect(engine.getPosition().fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});
