# Chess Game with LLM Integration

A web-based chess game that allows two players to play on the same PC, with AI-powered natural language move conversion using Claude API.

## Features

- ✅ Full chess game implementation with move validation
- ✅ Interactive web interface with drag-and-drop board
- ✅ Support for both algebraic notation (e2e4) and natural language moves
- ✅ LLM integration for converting text like "move pawn to e4" into chess moves
- ✅ Move history tracking
- ✅ Game state management

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up Claude API (Optional but recommended):**
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=your_api_key_here
     ```

3. **Run the server:**
   ```bash
   bun run src/index.ts
   ```
   or
   ```bash
   bun run start
   ```

4. **Open the game:**
   - Navigate to `http://localhost:3000`
   - Start playing chess!

## How to Play

### Making Moves

You can make moves in several ways:

1. **Click the board:** Click on a piece, then click the destination square
2. **Algebraic notation:** Type moves like `e2e4`, `Nf3`, `O-O`
3. **Natural language:** Type moves like:
   - "move pawn to e4"
   - "knight to f3"
   - "castle kingside"
   - "take the pawn on d5"

### Examples of Natural Language Moves

- `"move the pawn from e2 to e4"`
- `"knight takes bishop on f7"`
- `"castle kingside"`
- `"queen to h5"`
- `"rook captures on a8"`

## API Endpoints

- `GET /api/game/state` - Get current game state
- `POST /api/game/move` - Make a move (body: `{move: "e2e4"}`)
- `POST /api/game/reset` - Reset the game
- `POST /api/game/suggest` - Get move suggestions from AI

## Project Structure

```
src/
├── index.ts              # Express server setup
├── lib/
│   ├── chess.ts          # Chess game logic and rules
│   └── llm-service.ts    # Claude API integration
└── routes/
    └── chess.routes.ts   # API endpoints
public/
└── index.html           # Web interface
```

## Dependencies

- **Express** - Web server
- **@anthropic-ai/sdk** - Claude API integration
- **TypeScript** - Type safety

## Notes

- The LLM features require an Anthropic API key
- Without the API key, you can still play using algebraic notation
- The game supports all standard chess rules including castling, en passant, and pawn promotion
- Move validation ensures only legal moves are allowed

This project was created using `bun init` in bun v1.2.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.