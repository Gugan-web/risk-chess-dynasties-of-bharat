import { Chess, type Square, type Move, type PieceSymbol, type Color } from 'chess.js';

export interface GamePosition {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  moveNumber: number;
}

export interface CaptureInfo {
  capturedPiece: PieceSymbol;
  capturedColor: Color;
  capturingPiece: PieceSymbol;
  capturingColor: Color;
  square: Square;
}

export interface MoveResult {
  move: Move;
  position: GamePosition;
  capture: CaptureInfo | null;
  isPromotion: boolean;
  isCastling: boolean;
  isEnPassant: boolean;
}

export interface SquareInfo {
  piece: PieceSymbol | null;
  color: Color | null;
  square: Square;
  isAttackedByWhite: boolean;
  isAttackedByBlack: boolean;
}

export class ChessEngine {
  private game: Chess;
  private moveHistory: Move[] = [];
  private capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] } = {
    white: [],
    black: [],
  };

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  getPosition(): GamePosition {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      moveNumber: Math.ceil(this.game.moveNumber()),
    };
  }

  getLegalMoves(square?: Square): Move[] {
    if (square) {
      return this.game.moves({ square, verbose: true });
    }
    return this.game.moves({ verbose: true });
  }

  makeMove(from: Square, to: Square, promotion?: PieceSymbol): MoveResult | null {
    const pieceAtDest = this.game.get(to);
    const pieceAtFrom = this.game.get(from);

    try {
      const move = this.game.move({ from, to, promotion: promotion || undefined });
      if (!move) return null;

      this.moveHistory.push(move);

      let capture: CaptureInfo | null = null;
      if (move.captured) {
        const capturedColor: Color = move.color === 'w' ? 'b' : 'w';
        capture = {
          capturedPiece: move.captured as PieceSymbol,
          capturedColor: capturedColor,
          capturingPiece: move.piece as PieceSymbol,
          capturingColor: move.color as Color,
          square: to,
        };
        const colorKey = capturedColor === 'w' ? 'white' : 'black';
        this.capturedPieces[colorKey].push(move.captured as PieceSymbol);
      }

      return {
        move,
        position: this.getPosition(),
        capture,
        isPromotion: !!move.promotion,
        isCastling: move.flags.includes('k') || move.flags.includes('q'),
        isEnPassant: move.flags.includes('e'),
      };
    } catch {
      return null;
    }
  }

  undo(): Move | null {
    const move = this.game.undo();
    if (move) {
      this.moveHistory.pop();
      if (move.captured) {
        const capturedColor: Color = move.color === 'w' ? 'b' : 'w';
        const colorKey = capturedColor === 'w' ? 'white' : 'black';
        const idx = this.capturedPieces[colorKey].lastIndexOf(move.captured as PieceSymbol);
        if (idx >= 0) this.capturedPieces[colorKey].splice(idx, 1);
      }
    }
    return move;
  }

  getSquareInfo(square: Square): SquareInfo {
    const piece = this.game.get(square);
    return {
      piece: piece ? (piece.type as PieceSymbol) : null,
      color: piece ? (piece.color as Color) : null,
      square,
      isAttackedByWhite: this.game.isAttacked(square, 'w'),
      isAttackedByBlack: this.game.isAttacked(square, 'b'),
    };
  }

  getAttackers(square: Square, byColor: Color): Square[] {
    const attackers: Square[] = [];
    const allMoves = this.game.moves({ verbose: true });
    // Check all pieces of the given color that can move to this square
    for (const move of allMoves) {
      if (move.to === square && move.color === byColor) {
        if (!attackers.includes(move.from)) {
          attackers.push(move.from);
        }
      }
    }
    return attackers;
  }

  getDefenders(square: Square, pieceColor: Color): number {
    // Temporarily remove the piece to see who defends
    // Simpler approach: count pieces of same color that can see this square
    const defenderColor = pieceColor;
    let count = 0;
    const files = 'abcdefgh';
    const ranks = '12345678';
    for (const f of files) {
      for (const r of ranks) {
        const sq = (f + r) as Square;
        const piece = this.game.get(sq);
        if (piece && piece.color === defenderColor && sq !== square) {
          // Check if this piece protects the square (simplified)
          if (this.game.isAttacked(square, defenderColor)) {
            count++;
            break; // Just need to know if defended
          }
        }
      }
    }
    return count > 0 ? count : 0;
  }

  isSquareAttacked(square: Square, byColor: Color): boolean {
    return this.game.isAttacked(square, byColor);
  }

  getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  getCapturedPieces(): { white: PieceSymbol[]; black: PieceSymbol[] } {
    return {
      white: [...this.capturedPieces.white],
      black: [...this.capturedPieces.black],
    };
  }

  getFen(): string {
    return this.game.fen();
  }

  getPgn(): string {
    return this.game.pgn();
  }

  getTurn(): Color {
    return this.game.turn();
  }

  reset(fen?: string): void {
    if (fen) {
      this.game = new Chess(fen);
    } else {
      this.game.reset();
    }
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
  }

  getBoardArray(): ({ type: PieceSymbol; color: Color } | null)[][] {
    return this.game.board();
  }

  getPieceAt(square: Square): { type: PieceSymbol; color: Color } | null {
    const piece = this.game.get(square);
    return piece ? { type: piece.type as PieceSymbol, color: piece.color as Color } : null;
  }

  clone(): ChessEngine {
    const engine = new ChessEngine(this.game.fen());
    engine.moveHistory = [...this.moveHistory];
    engine.capturedPieces = {
      white: [...this.capturedPieces.white],
      black: [...this.capturedPieces.black],
    };
    return engine;
  }
}
