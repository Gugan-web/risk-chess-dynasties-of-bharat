import type { Color } from 'chess.js';
import type { StockfishDifficulty } from './stockfish-worker';

export type GameMode = 'classic' | 'local' | 'practice' | 'tutorial' | 'demo';

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'playing'
  | 'investment_prompt'
  | 'resolving'
  | 'game_over';

export type GameResult = 'checkmate' | 'stalemate' | 'resign' | 'draw' | null;

export interface GameConfig {
  mode: GameMode;
  difficulty: StockfishDifficulty;
  playerColor: Color;
  playerName: string;
  opponentName: string;
  startingCapital: number;
}

export interface GameSummary {
  result: GameResult;
  winner: Color | null;
  totalMoves: number;
  // Chess metrics
  materialGainedWhite: number;
  materialLostWhite: number;
  materialGainedBlack: number;
  materialLostBlack: number;
  // Investment metrics
  totalInvestedWhite: number;
  totalReturnWhite: number;
  investmentCountWhite: number;
  successfulInvestmentsWhite: number;
  totalInvestedBlack: number;
  totalReturnBlack: number;
  investmentCountBlack: number;
  successfulInvestmentsBlack: number;
  // Final state
  finalCapitalWhite: number;
  finalCapitalBlack: number;
  duration: number; // seconds
}

export function getDefaultConfig(): GameConfig {
  return {
    mode: 'classic',
    difficulty: 'intermediate',
    playerColor: 'w',
    playerName: 'Player',
    opponentName: 'AI',
    startingCapital: 10000,
  };
}

export function getModeLabel(mode: GameMode): string {
  switch (mode) {
    case 'classic': return 'Classic Risk Chess';
    case 'local': return 'Local Duel';
    case 'practice': return 'Practice';
    case 'tutorial': return 'Tutorial';
    case 'demo': return 'Demo';
  }
}

export function getDifficultyLabel(d: StockfishDifficulty): string {
  switch (d) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Intermediate';
    case 'advanced': return 'Advanced';
  }
}
