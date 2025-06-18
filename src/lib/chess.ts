export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type Position = { row: number; col: number };

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  gameStatus: 'ongoing' | 'checkmate' | 'stalemate' | 'draw';
  moveHistory: string[];
}

export class ChessGame {
  private board: (ChessPiece | null)[][];
  private currentPlayer: PieceColor;
  private gameStatus: 'ongoing' | 'checkmate' | 'stalemate' | 'draw';
  private moveHistory: string[];

  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.gameStatus = 'ongoing';
    this.moveHistory = [];
  }

  private initializeBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pawns
    for (let col = 0; col < 8; col++) {
      board[1]![col] = { type: 'pawn', color: 'black' };
      board[6]![col] = { type: 'pawn', color: 'white' };
    }
    
    // Place other pieces
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    for (let col = 0; col < 8; col++) {
      board[0]![col] = { type: pieceOrder[col]!, color: 'black' };
      board[7]![col] = { type: pieceOrder[col]!, color: 'white' };
    }
    
    return board;
  }

  getGameState(): GameState {
    return {
      board: this.board.map(row => [...row]),
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      moveHistory: [...this.moveHistory]
    };
  }

  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPieceAt(row: number, col: number): ChessPiece | null {
    if (!this.isValidPosition(row, col)) return null;
    return this.board[row]?.[col] ?? null;
  }

  makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    if (!this.isValidPosition(fromRow, fromCol) || !this.isValidPosition(toRow, toCol)) {
      return false;
    }

    const piece = this.getPieceAt(fromRow, fromCol);
    if (!piece || piece.color !== this.currentPlayer) {
      return false;
    }

    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    // Make the move
    this.board[toRow]![toCol] = piece;
    this.board[fromRow]![fromCol] = null;
    piece.hasMoved = true;

    // Record move in algebraic notation
    const moveNotation = this.formatMove(fromRow, fromCol, toRow, toCol, piece);
    this.moveHistory.push(moveNotation);

    // Switch players
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    return true;
  }

  private isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const piece = this.getPieceAt(fromRow, fromCol);
    if (!piece) return false;

    const targetPiece = this.getPieceAt(toRow, toCol);
    if (targetPiece && targetPiece.color === piece.color) {
      return false; // Can't capture own piece
    }

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
      case 'rook':
        return this.isValidRookMove(rowDiff, colDiff) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return this.isValidKnightMove(rowDiff, colDiff);
      case 'bishop':
        return this.isValidBishopMove(rowDiff, colDiff) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return (this.isValidRookMove(rowDiff, colDiff) || this.isValidBishopMove(rowDiff, colDiff)) && 
               this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'king':
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
      default:
        return false;
    }
  }

  private isValidPawnMove(fromRow: number, fromCol: number, toRow: number, toCol: number, color: PieceColor): boolean {
    const direction = color === 'white' ? -1 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    const targetPiece = this.getPieceAt(toRow, toCol);

    // Forward move
    if (colDiff === 0 && !targetPiece) {
      if (rowDiff === direction) return true;
      if (rowDiff === 2 * direction && (color === 'white' ? fromRow === 6 : fromRow === 1)) return true;
    }
    
    // Diagonal capture
    if (colDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== color) {
      return true;
    }

    return false;
  }

  private isValidRookMove(rowDiff: number, colDiff: number): boolean {
    return (rowDiff === 0 && colDiff !== 0) || (rowDiff !== 0 && colDiff === 0);
  }

  private isValidKnightMove(rowDiff: number, colDiff: number): boolean {
    return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || 
           (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
  }

  private isValidBishopMove(rowDiff: number, colDiff: number): boolean {
    return Math.abs(rowDiff) === Math.abs(colDiff) && rowDiff !== 0;
  }

  private isPathClear(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.getPieceAt(currentRow, currentCol)) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }

  private formatMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: ChessPiece): string {
    const fromSquare = String.fromCharCode(97 + fromCol) + (8 - fromRow);
    const toSquare = String.fromCharCode(97 + toCol) + (8 - toRow);
    const pieceSymbol = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
    return `${pieceSymbol}${fromSquare}${toSquare}`;
  }

  parseAlgebraicNotation(notation: string): { from: Position; to: Position } | null {
    // Simple parser for moves like "e2e4", "Nf3", etc.
    const match = notation.match(/^([RNBQK]?)([a-h][1-8])([a-h][1-8])$/);
    if (!match) return null;

    const [, , fromSquare, toSquare] = match;
    
    if (!fromSquare || !toSquare) return null;
    
    const from = this.squareToPosition(fromSquare);
    const to = this.squareToPosition(toSquare);
    
    if (!from || !to) return null;
    
    return { from, to };
  }

  private squareToPosition(square: string): Position | null {
    if (square.length !== 2) return null;
    
    const col = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const row = 8 - parseInt(square[1]!); // 8=0, 7=1, etc.
    
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    
    return { row, col };
  }

  makeAlgebraicMove(notation: string): boolean {
    const parsed = this.parseAlgebraicNotation(notation);
    if (!parsed) return false;
    
    return this.makeMove(parsed.from.row, parsed.from.col, parsed.to.row, parsed.to.col);
  }

  reset(): void {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.gameStatus = 'ongoing';
    this.moveHistory = [];
  }
}