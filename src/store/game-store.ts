import { create } from 'zustand';
import type { Square, Move, PieceSymbol, Color } from 'chess.js';
import { ChessEngine } from '../engine/chess-engine';
import type { CapitalState } from '../engine/capital';
import { createCapitalState, onCapture, makeInvestment, resolveInvestment, settleMatchResources } from '../engine/capital';
import type { InvestmentHistory, ActiveInvestment } from '../engine/investment';
import {
  createInvestmentHistory,
  addInvestment,
  resolveInvestmentInHistory,
  getActiveInvestments,
  moveActiveInvestment,
} from '../engine/investment';
import type { InvestmentOpportunity, RiskAnalysis } from '../engine/risk-calculator';
import {
  analyzeMove,
  createInvestmentOpportunity,
  shouldOfferInvestment,
  calculateReturn,
} from '../engine/risk-calculator';
import type { GameMode, GamePhase, GameResult, GameConfig } from '../engine/game-state';
import { getDefaultConfig } from '../engine/game-state';
import { INVESTMENT_PRESETS, STARTING_CAPITAL } from '../engine/piece-values';
import { StockfishManager, getSimpleAIMove, type StockfishDifficulty } from '../engine/stockfish-worker';

interface InvestmentResultInfo {
  success: boolean;
  amount: number;
  returnAmount: number;
  description: string;
  timestamp: number;
}

interface GameStore {
  // Engine
  engine: ChessEngine;
  stockfish: StockfishManager | null;
  stockfishReady: boolean;

  // Game state
  phase: GamePhase;
  config: GameConfig;
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  moveHistory: Move[];
  gameResult: GameResult;
  winner: Color | null;
  gameStartTime: number;

  // Capital (both players)
  capitalWhite: CapitalState;
  capitalBlack: CapitalState;

  // Investments (both players)
  investmentHistoryWhite: InvestmentHistory;
  investmentHistoryBlack: InvestmentHistory;

  // Current resource decision opportunity
  currentOpportunity: InvestmentOpportunity | null;
  pendingMoveFrom: Square | null;
  pendingMoveTo: Square | null;
  lastInvestmentMove: number;

  // Investment result notification
  investmentResult: InvestmentResultInfo | null;

  // AI thinking
  aiThinking: boolean;

  // Actions
  initGame: (config: GameConfig) => Promise<void>;
  selectSquare: (square: Square) => void;
  makePlayerMove: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  handleInvestmentDecision: (amount: number | null) => void;
  makeAIMove: () => Promise<void>;
  undoMove: () => void;
  resign: () => void;
  resetGame: () => void;
  dismissInvestmentResult: () => void;

  // Getters
  getCurrentCapital: () => CapitalState;
  getOpponentCapital: () => CapitalState;
  getCurrentInvestmentHistory: () => InvestmentHistory;
  isPlayerTurn: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engine: new ChessEngine(),
  stockfish: null,
  stockfishReady: false,

  phase: 'menu',
  config: getDefaultConfig(),
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  moveHistory: [],
  gameResult: null,
  winner: null,
  gameStartTime: Date.now(),

  capitalWhite: createCapitalState(),
  capitalBlack: createCapitalState(),

  investmentHistoryWhite: createInvestmentHistory(),
  investmentHistoryBlack: createInvestmentHistory(),

  currentOpportunity: null,
  pendingMoveFrom: null,
  pendingMoveTo: null,
  lastInvestmentMove: -10,

  investmentResult: null,
  aiThinking: false,

  initGame: async (config: GameConfig) => {
    const engine = new ChessEngine();
    let sf: StockfishManager | null = null;
    let sfReady = false;

    if (config.mode === 'classic' || config.mode === 'demo' || config.mode === 'practice') {
      sf = new StockfishManager();
      try {
        sfReady = await sf.init();
        if (sfReady) {
          sf.setDifficulty(config.difficulty);
        }
      } catch {
        sfReady = false;
      }
    }

    set({
      engine,
      stockfish: sf,
      stockfishReady: sfReady,
      phase: 'playing',
      config,
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      moveHistory: [],
      gameResult: null,
      winner: null,
      gameStartTime: Date.now(),
      capitalWhite: createCapitalState(config.startingCapital),
      capitalBlack: createCapitalState(config.startingCapital),
      investmentHistoryWhite: createInvestmentHistory(),
      investmentHistoryBlack: createInvestmentHistory(),
      currentOpportunity: null,
      pendingMoveFrom: null,
      pendingMoveTo: null,
      lastInvestmentMove: -10,
      investmentResult: null,
      aiThinking: false,
    });

    // If AI plays white (player chose black), AI moves first
    if (config.mode === 'classic' && config.playerColor === 'b') {
      setTimeout(() => get().makeAIMove(), 500);
    }
  },

  selectSquare: (square: Square) => {
    const { engine, selectedSquare, phase, config, aiThinking } = get();
    if (phase !== 'playing' || aiThinking) return;

    const turn = engine.getTurn();

    // In classic mode, only allow moves on player's turn
    if (config.mode === 'classic' && turn !== config.playerColor) return;

    const piece = engine.getPieceAt(square);

    // If a piece is already selected
    if (selectedSquare) {
      // Check if this is a valid destination
      const { legalMoves } = get();
      const validMove = legalMoves.find((m) => m.to === square);

      if (validMove) {
        // Check for promotion
        if (validMove.piece === 'p' && (square[1] === '8' || square[1] === '1')) {
          get().makePlayerMove(selectedSquare, square, 'q'); // Auto-promote to queen for now
        } else {
          get().makePlayerMove(selectedSquare, square);
        }
        return;
      }

      // If clicking another own piece, re-select
      if (piece && piece.color === turn) {
        const moves = engine.getLegalMoves(square);
        set({ selectedSquare: square, legalMoves: moves });
        return;
      }

      // Deselect
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    // Select a piece
    if (piece && piece.color === turn) {
      const moves = engine.getLegalMoves(square);
      set({ selectedSquare: square, legalMoves: moves });
    }
  },

  makePlayerMove: (from: Square, to: Square, promotion?: PieceSymbol) => {
    const { engine, config, lastInvestmentMove } = get();
    const currentTurn = engine.getTurn();
    const result = engine.makeMove(from, to, promotion);

    if (!result) return;

    const position = result.position;
    const moveNum = position.moveNumber;

    // Update capital on captures
    if (result.capture) {
      const capturingIsWhite = result.capture.capturingColor === 'w';
      const { capitalWhite, capitalBlack } = get();

      set({
        capitalWhite: capturingIsWhite
          ? onCapture(capitalWhite, result.capture.capturedPiece, true, moveNum)
          : onCapture(capitalWhite, result.capture.capturedPiece, false, moveNum),
        capitalBlack: !capturingIsWhite
          ? onCapture(capitalBlack, result.capture.capturedPiece, true, moveNum)
          : onCapture(capitalBlack, result.capture.capturedPiece, false, moveNum),
      });

      // Resolve any active investments on the captured piece
      resolveActiveInvestments(get, set, result.capture.capturedPiece, result.capture.capturedColor, result.capture.square, moveNum);
    }

    moveActiveInvestmentForMove(get, set, result.move);

    set({
      selectedSquare: null,
      legalMoves: [],
      lastMove: { from, to },
      moveHistory: engine.getMoveHistory(),
    });

    // Check game over
    if (position.isGameOver) {
      let gameResult: GameResult = null;
      let winner: Color | null = null;
      if (position.isCheckmate) {
        gameResult = 'checkmate';
        winner = currentTurn; // The player who made the move wins
      } else if (position.isStalemate) {
        gameResult = 'stalemate';
      } else {
        gameResult = 'draw';
      }
      finishGame(get, set, gameResult, winner, position.moveNumber);
      return;
    }

    // Check if should offer investment
    if (result.capture && shouldOfferInvestment(result.move, moveNum, lastInvestmentMove)) {
      const analysis = analyzeMove(engine, from, to, result.move);
      if (analysis) {
        const availableCapital = currentTurn === 'w' ? get().capitalWhite.available : get().capitalBlack.available;
        if (availableCapital >= INVESTMENT_PRESETS[0]) {
          const opportunity = createInvestmentOpportunity(
            analysis, from, to, availableCapital, moveNum, INVESTMENT_PRESETS
          );
          set({
            phase: 'investment_prompt',
            currentOpportunity: opportunity,
            pendingMoveFrom: from,
            pendingMoveTo: to,
          });
          return;
        }
      }
    }

    // Continue to AI move if needed
    if (config.mode === 'classic' || config.mode === 'demo' || config.mode === 'practice') {
      set({ aiThinking: true });
      setTimeout(() => get().makeAIMove(), 300);
    }
  },

  handleInvestmentDecision: (amount: number | null) => {
    const { engine, currentOpportunity, config } = get();
    const turn = engine.getTurn() === 'w' ? 'b' : 'w'; // The player who just moved

    if (currentOpportunity && amount !== null && amount > 0) {
      // Make the investment
      const capitalKey = turn === 'w' ? 'capitalWhite' : 'capitalBlack';
      const historyKey = turn === 'w' ? 'investmentHistoryWhite' : 'investmentHistoryBlack';
      const capital = get()[capitalKey];
      const history = get()[historyKey];

      const newCapital = makeInvestment(
        capital,
        amount,
        `Committed resources to ${currentOpportunity.analysis.capturingPiece} at ${currentOpportunity.moveTo}`,
        currentOpportunity.moveNumber
      );

      if (newCapital) {
        const investment: ActiveInvestment = {
          id: `inv_${Date.now()}`,
          pieceType: currentOpportunity.analysis.capturingPiece,
          pieceSquare: currentOpportunity.moveTo,
          pieceColor: turn,
          amount,
          opportunity: currentOpportunity,
          status: 'active',
          timestamp: Date.now(),
        };

        const newHistory = addInvestment(history, investment);

        // Schedule investment resolution (will resolve when piece is captured or after N moves)
        set({
          [capitalKey]: newCapital,
          [historyKey]: newHistory,
          lastInvestmentMove: currentOpportunity.moveNumber,
        } as any);

        // Auto-resolve after 4 moves if piece still alive
        const resolveAfterMoves = 4;
        const resolveMoveNum = currentOpportunity.moveNumber + resolveAfterMoves;
        scheduleResolution(get, set, investment, resolveMoveNum);
      }
    }

    set({
      phase: 'playing',
      currentOpportunity: null,
      pendingMoveFrom: null,
      pendingMoveTo: null,
    });

    // Continue to AI move if needed
    if (config.mode === 'classic' || config.mode === 'demo' || config.mode === 'practice') {
      set({ aiThinking: true });
      setTimeout(() => get().makeAIMove(), 300);
    }
  },

  makeAIMove: async () => {
    const { engine, stockfish, stockfishReady, config } = get();
    if (engine.getPosition().isGameOver) {
      set({ aiThinking: false });
      return;
    }

    let aiMove: { from: string; to: string } | null = null;

    if (stockfishReady && stockfish) {
      const bestMove = await stockfish.getBestMove(engine.getFen());
      if (bestMove && bestMove.length >= 4) {
        aiMove = {
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
        };
      }
    }

    if (!aiMove) {
      // Fallback to simple AI
      const legalMoves = engine.getLegalMoves();
      aiMove = getSimpleAIMove(
        legalMoves.map((m) => ({ from: m.from, to: m.to, captured: m.captured, san: m.san })),
        config.difficulty
      );
    }

    if (!aiMove) {
      set({ aiThinking: false });
      return;
    }

    const currentTurn = engine.getTurn();
    const result = engine.makeMove(aiMove.from as Square, aiMove.to as Square);
    if (!result) {
      set({ aiThinking: false });
      return;
    }

    const moveNum = result.position.moveNumber;

    // Update capital on captures
    if (result.capture) {
      const capturingIsWhite = result.capture.capturingColor === 'w';
      const { capitalWhite, capitalBlack } = get();

      set({
        capitalWhite: capturingIsWhite
          ? onCapture(capitalWhite, result.capture.capturedPiece, true, moveNum)
          : onCapture(capitalWhite, result.capture.capturedPiece, false, moveNum),
        capitalBlack: !capturingIsWhite
          ? onCapture(capitalBlack, result.capture.capturedPiece, true, moveNum)
          : onCapture(capitalBlack, result.capture.capturedPiece, false, moveNum),
      });

      resolveActiveInvestments(get, set, result.capture.capturedPiece, result.capture.capturedColor, result.capture.square, moveNum);
    }

    moveActiveInvestmentForMove(get, set, result.move);

    set({
      lastMove: { from: aiMove.from as Square, to: aiMove.to as Square },
      moveHistory: engine.getMoveHistory(),
      aiThinking: false,
    });

    // Check game over
    if (result.position.isGameOver) {
      let gameResult: GameResult = null;
      let winner: Color | null = null;
      if (result.position.isCheckmate) {
        gameResult = 'checkmate';
        winner = currentTurn;
      } else if (result.position.isStalemate) {
        gameResult = 'stalemate';
      } else {
        gameResult = 'draw';
      }
      finishGame(get, set, gameResult, winner, result.position.moveNumber);
    }
  },

  undoMove: () => {
    const { engine, config } = get();
    if (config.mode === 'classic') {
      // Undo AI move + player move
      engine.undo();
      engine.undo();
    } else {
      engine.undo();
    }
    set({
      selectedSquare: null,
      legalMoves: [],
      moveHistory: engine.getMoveHistory(),
      lastMove: null,
    });
  },

  resign: () => {
    const { engine, config } = get();
    const turn = engine.getTurn();
    const winner: Color = turn === 'w' ? 'b' : 'w';
    finishGame(get, set, 'resign', winner, engine.getPosition().moveNumber);
  },

  resetGame: () => {
    const { stockfish } = get();
    if (stockfish) stockfish.destroy();
    set({
      engine: new ChessEngine(),
      stockfish: null,
      stockfishReady: false,
      phase: 'menu',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      moveHistory: [],
      gameResult: null,
      winner: null,
      capitalWhite: createCapitalState(),
      capitalBlack: createCapitalState(),
      investmentHistoryWhite: createInvestmentHistory(),
      investmentHistoryBlack: createInvestmentHistory(),
      currentOpportunity: null,
      investmentResult: null,
      aiThinking: false,
    });
  },

  dismissInvestmentResult: () => {
    set({ investmentResult: null });
  },

  getCurrentCapital: () => {
    const { config, capitalWhite, capitalBlack } = get();
    return config.playerColor === 'w' ? capitalWhite : capitalBlack;
  },

  getOpponentCapital: () => {
    const { config, capitalWhite, capitalBlack } = get();
    return config.playerColor === 'w' ? capitalBlack : capitalWhite;
  },

  getCurrentInvestmentHistory: () => {
    const { config, investmentHistoryWhite, investmentHistoryBlack } = get();
    return config.playerColor === 'w' ? investmentHistoryWhite : investmentHistoryBlack;
  },

  isPlayerTurn: () => {
    const { engine, config } = get();
    if (config.mode === 'local') return true; // Both players share device
    return engine.getTurn() === config.playerColor;
  },
}));

// Helpers
function finishGame(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  gameResult: GameResult,
  winner: Color | null,
  moveNumber: number
) {
  const state = get();
  const settlement = createSettlementState(state, winner, moveNumber);

  set({
    phase: 'game_over',
    gameResult,
    winner,
    ...settlement,
  });
}

function createSettlementState(
  state: GameStore,
  winner: Color | null,
  moveNumber: number
): Partial<GameStore> {
  if (!winner) return {};

  const { config, capitalWhite, capitalBlack } = state;

  if (winner === 'w') {
    const settlement = settleMatchResources(
      capitalWhite,
      capitalBlack,
      config.startingCapital,
      moveNumber
    );

    return {
      capitalWhite: settlement.winnerState,
      capitalBlack: settlement.loserState,
    };
  }

  const settlement = settleMatchResources(
    capitalBlack,
    capitalWhite,
    config.startingCapital,
    moveNumber
  );

  return {
    capitalBlack: settlement.winnerState,
    capitalWhite: settlement.loserState,
  };
}

function moveActiveInvestmentForMove(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  move: Move
) {
  const pieceColor = move.color as Color;
  const historyKey = pieceColor === 'w' ? 'investmentHistoryWhite' : 'investmentHistoryBlack';
  const history = get()[historyKey];
  const updatedHistory = moveActiveInvestment(
    history,
    move.from as Square,
    move.to as Square,
    pieceColor,
    move.piece as PieceSymbol,
    move.promotion as PieceSymbol | undefined
  );

  if (updatedHistory !== history) {
    set({ [historyKey]: updatedHistory } as any);
  }
}

function resolveActiveInvestments(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  capturedPiece: PieceSymbol,
  capturedColor: Color,
  square: Square,
  moveNumber: number
) {
  const historyKey = capturedColor === 'w' ? 'investmentHistoryWhite' : 'investmentHistoryBlack';
  const capitalKey = capturedColor === 'w' ? 'capitalWhite' : 'capitalBlack';
  const history = get()[historyKey];
  const capital = get()[capitalKey];

  const activeInvestments = getActiveInvestments(history);
  for (const inv of activeInvestments) {
    if (inv.pieceSquare === square && inv.pieceColor === capturedColor) {
      // Piece was captured — investment fails
      const result = calculateReturn(inv.amount, inv.opportunity.analysis, false);
      const newHistory = resolveInvestmentInHistory(history, inv.id, false, Math.abs(result.returnAmount), moveNumber);
      const newCapital = resolveInvestment(capital, inv.amount, Math.abs(result.returnAmount), false, result.description, moveNumber);

      set({
        [historyKey]: newHistory,
        [capitalKey]: newCapital,
        investmentResult: {
          success: false,
          amount: inv.amount,
          returnAmount: result.returnAmount,
          description: result.description,
          timestamp: Date.now(),
        },
      } as any);
    }
  }
}

function scheduleResolution(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  investment: ActiveInvestment,
  resolveMoveNum: number
) {
  // Use a polling approach — check every second if we've reached the target move
  const check = () => {
    const state = get();
    const currentMove = state.engine.getPosition().moveNumber;
    const historyKey = investment.pieceColor === 'w' ? 'investmentHistoryWhite' : 'investmentHistoryBlack';
    const capitalKey = investment.pieceColor === 'w' ? 'capitalWhite' : 'capitalBlack';
    const history = state[historyKey];

    // Check if already resolved
    const inv = history.investments.find((i) => i.id === investment.id);
    if (!inv || inv.status !== 'active') return;

    if (currentMove >= resolveMoveNum) {
      // Verify piece is still on the board and alive
      const squareInfo = state.engine.getSquareInfo(inv.pieceSquare);
      const pieceAlive = squareInfo.piece === inv.pieceType && squareInfo.color === inv.pieceColor;
      if (!pieceAlive) return;

      // Piece survived — investment succeeds
      const result = calculateReturn(investment.amount, investment.opportunity.analysis, true);
      const capital = state[capitalKey];
      const newHistory = resolveInvestmentInHistory(history, investment.id, true, result.returnAmount, currentMove);
      const newCapital = resolveInvestment(capital, investment.amount, result.returnAmount, true, result.description, currentMove);

      set({
        [historyKey]: newHistory,
        [capitalKey]: newCapital,
        investmentResult: {
          success: true,
          amount: investment.amount,
          returnAmount: result.returnAmount,
          description: result.description,
          timestamp: Date.now(),
        },
      } as any);
    } else {
      setTimeout(check, 2000);
    }
  };

  setTimeout(check, 3000);
}
