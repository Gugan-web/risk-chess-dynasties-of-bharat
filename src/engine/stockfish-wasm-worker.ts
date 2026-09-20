// Web Worker for off-thread AI chess calculation
import { Chess } from 'chess.js';

let chess = new Chess();

self.onmessage = (e: MessageEvent) => {
  const line = (typeof e.data === 'string' ? e.data : '').trim();

  if (line === 'uci') {
    self.postMessage('id name RiskChessEngine 1.0');
    self.postMessage('id author RiskChess');
    self.postMessage('uciok');
    return;
  }

  if (line === 'isready') {
    self.postMessage('readyok');
    return;
  }

  if (line.startsWith('position fen ')) {
    const fen = line.replace('position fen ', '').trim();
    try {
      chess = new Chess(fen);
    } catch {
      // ignore
    }
    return;
  }

  if (line.startsWith('go')) {
    // Extract depth or calculate best move
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
      self.postMessage('bestmove (none)');
      return;
    }

    // Heuristic minimax:
    // 1. Checkmate move
    const mateMove = moves.find((m) => m.san.includes('#'));
    if (mateMove) {
      self.postMessage(`bestmove ${mateMove.from}${mateMove.to}${mateMove.promotion || ''}`);
      return;
    }

    // 2. Checks
    const checkMoves = moves.filter((m) => m.san.includes('+'));
    if (checkMoves.length > 0 && Math.random() > 0.4) {
      const pick = checkMoves[Math.floor(Math.random() * checkMoves.length)];
      self.postMessage(`bestmove ${pick.from}${pick.to}${pick.promotion || ''}`);
      return;
    }

    // 3. Captures by value
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0) {
      const pieceWeights: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
      captures.sort((a, b) => (pieceWeights[b.captured || 'p'] || 0) - (pieceWeights[a.captured || 'p'] || 0));
      const pick = captures[0];
      self.postMessage(`bestmove ${pick.from}${pick.to}${pick.promotion || ''}`);
      return;
    }

    // 4. Center control / develop
    const centerMoves = moves.filter((m) => ['d4', 'd5', 'e4', 'e5', 'c4', 'c5'].includes(m.to));
    if (centerMoves.length > 0 && Math.random() > 0.3) {
      const pick = centerMoves[Math.floor(Math.random() * centerMoves.length)];
      self.postMessage(`bestmove ${pick.from}${pick.to}${pick.promotion || ''}`);
      return;
    }

    // Default: random legal move
    const pick = moves[Math.floor(Math.random() * moves.length)];
    self.postMessage(`bestmove ${pick.from}${pick.to}${pick.promotion || ''}`);
  }
};
