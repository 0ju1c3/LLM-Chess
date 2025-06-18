import Anthropic from '@anthropic-ai/sdk';

export class LLMService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async convertTextToMove(text: string, gameState: any): Promise<string | null> {
    const prompt = this.createMoveConversionPrompt(text, gameState);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.extractMoveFromResponse(content.text);
      }
      
      return null;
    } catch (error) {
      console.error('LLM API Error:', error);
      return null;
    }
  }

  private createMoveConversionPrompt(text: string, gameState: any): string {
    const currentPlayer = gameState.currentPlayer;
    const boardDescription = this.describeBoardState(gameState.board);
    
    return `You are a chess move converter. Convert natural language chess moves to standard algebraic notation.

Current game state:
- Current player: ${currentPlayer}
- Board state: ${boardDescription}

Rules:
1. Convert the user's move to algebraic notation (e.g., "e2e4", "Nf3", "O-O")
2. Only return the move notation, nothing else
3. If the move is unclear or invalid, return "INVALID"

User's move request: "${text}"

Move notation:`;
  }

  private describeBoardState(board: any[][]): string {
    const pieces: string[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const square = String.fromCharCode(97 + col) + (8 - row);
          pieces.push(`${piece.color} ${piece.type} on ${square}`);
        }
      }
    }
    
    return pieces.join(', ');
  }

  private extractMoveFromResponse(response: string): string | null {
    const trimmed = response.trim();
    
    if (trimmed.includes('INVALID') || trimmed.includes('invalid')) {
      return null;
    }
    
    const movePatterns = [
      /\b([a-h][1-8][a-h][1-8])\b/,  
      /\b([RNBQK]?[a-h]?[1-8]?x?[a-h][1-8])\b/, 
      /\b(O-O-O|O-O)\b/, 
    ];
    
    for (const pattern of movePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    const words = trimmed.split(/\s+/);
    for (const word of words) {
      if (/^[a-h][1-8][a-h][1-8]$/.test(word)) {
        return word;
      }
      if (/^[RNBQK]?[a-h]?[1-8]?x?[a-h][1-8]$/.test(word)) {
        return word;
      }
    }
    
    return null;
  }

  async isValidMoveText(text: string): Promise<boolean> {
    const commonChessWords = [
      'move', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king',
      'castle', 'capture', 'check', 'checkmate', 'to', 'takes'
    ];
    
    const lowerText = text.toLowerCase();
    
    if (/[a-h][1-8]/.test(text)) {
      return true;
    }
    
    return commonChessWords.some(word => lowerText.includes(word));
  }
}