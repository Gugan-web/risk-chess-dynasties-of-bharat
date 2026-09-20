export type StockfishDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface StockfishConfig {
  depth: number;
  skillLevel: number;
  moveTime: number;
}

const DIFFICULTY_CONFIGS: Record<StockfishDifficulty, StockfishConfig> = {
  beginner: { depth: 2, skillLevel: 1, moveTime: 500 },
  intermediate: { depth: 6, skillLevel: 8, moveTime: 1000 },
  advanced: { depth: 14, skillLevel: 18, moveTime: 2000 },
};

export class StockfishManager {
  private worker: Worker | null = null;
  private isReady = false;
  private pendingResolve: ((move: string) => void) | null = null;
  private difficulty: StockfishDifficulty = 'intermediate';
  private available = false;

  async init(): Promise<boolean> {
    try {
      // Try loading stockfish from CDN or local
      this.worker = new Worker(
        new URL('./stockfish-wasm-worker.ts', import.meta.url),
        { type: 'module' }
      );

      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          this.available = false;
          resolve(false);
        }, 5000);

        this.worker!.onmessage = (e: MessageEvent) => {
          const msg = typeof e.data === 'string' ? e.data : '';

          if (msg.includes('uciok') || msg.includes('readyok')) {
            if (!this.isReady) {
              this.isReady = true;
              this.available = true;
              clearTimeout(timeout);
              resolve(true);
            }
          }

          if (msg.startsWith('bestmove')) {
            const parts = msg.split(' ');
            const move = parts[1];
            if (this.pendingResolve && move) {
              this.pendingResolve(move);
              this.pendingResolve = null;
            }
          }
        };

        this.worker!.onerror = () => {
          this.available = false;
          clearTimeout(timeout);
          resolve(false);
        };

        this.sendCommand('uci');
      });
    } catch {
      this.available = false;
      return false;
    }
  }

  isAvailable(): boolean {
    return this.available && this.isReady;
  }

  setDifficulty(difficulty: StockfishDifficulty): void {
    this.difficulty = difficulty;
    if (this.isReady) {
      const config = DIFFICULTY_CONFIGS[difficulty];
      this.sendCommand(`setoption name Skill Level value ${config.skillLevel}`);
    }
  }

  async getBestMove(fen: string): Promise<string | null> {
    if (!this.isReady || !this.worker) return null;

    const config = DIFFICULTY_CONFIGS[this.difficulty];

    return new Promise<string | null>((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingResolve = null;
        resolve(null);
      }, config.moveTime + 3000);

      this.pendingResolve = (move: string) => {
        clearTimeout(timeout);
        resolve(move);
      };

      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${config.depth} movetime ${config.moveTime}`);
    });
  }

  private sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  destroy(): void {
    if (this.worker) {
      this.sendCommand('quit');
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.available = false;
  }
}

// Fallback: pick a random legal move
export function getRandomMove(legalMoves: string[]): string | null {
  if (legalMoves.length === 0) return null;
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// Simple minimax AI for when Stockfish is unavailable
export function getSimpleAIMove(
  legalMoves: { from: string; to: string; captured?: string; san: string }[],
  difficulty: StockfishDifficulty
): { from: string; to: string } | null {
  if (legalMoves.length === 0) return null;

  // Beginner: prefer captures, but with random element
  if (difficulty === 'beginner') {
    const captures = legalMoves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() > 0.3) {
      const pick = captures[Math.floor(Math.random() * captures.length)];
      return { from: pick.from, to: pick.to };
    }
    const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: pick.from, to: pick.to };
  }

  // Intermediate: prioritize checks and captures
  if (difficulty === 'intermediate') {
    const checks = legalMoves.filter((m) => m.san.includes('+'));
    if (checks.length > 0) {
      const pick = checks[Math.floor(Math.random() * checks.length)];
      return { from: pick.from, to: pick.to };
    }
    const captures = legalMoves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() > 0.15) {
      const pick = captures[Math.floor(Math.random() * captures.length)];
      return { from: pick.from, to: pick.to };
    }
    // Prefer center control
    const centerMoves = legalMoves.filter((m) =>
      ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(m.to)
    );
    if (centerMoves.length > 0 && Math.random() > 0.4) {
      const pick = centerMoves[Math.floor(Math.random() * centerMoves.length)];
      return { from: pick.from, to: pick.to };
    }
    const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: pick.from, to: pick.to };
  }

  // Advanced (fallback): same as intermediate but more deterministic
  const checks = legalMoves.filter((m) => m.san.includes('+') || m.san.includes('#'));
  if (checks.length > 0) {
    const pick = checks[Math.floor(Math.random() * checks.length)];
    return { from: pick.from, to: pick.to };
  }
  const captures = legalMoves.filter((m) => m.captured);
  if (captures.length > 0) {
    // Pick highest value capture
    const vals: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
    captures.sort((a, b) => (vals[b.captured || 'p'] || 0) - (vals[a.captured || 'p'] || 0));
    return { from: captures[0].from, to: captures[0].to };
  }
  const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  return { from: pick.from, to: pick.to };
}
