import { Router } from 'express';
import { ChessGame } from '../lib/chess.js';
import { LLMService } from '../lib/llm-service.js';

const router = Router();
const game = new ChessGame();
const llmService = new LLMService();

// Get current game state
router.get('/state', (req, res) => {
  try {
    const gameState = game.getGameState();
    res.json(gameState);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

// Make a move
router.post('/move', async (req, res) => {
  try {
    const { move } = req.body;
    
    if (!move || typeof move !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Move is required and must be a string' 
      });
    }

    let moveNotation = move;
    
    // Check if this looks like natural language instead of algebraic notation
    const isNaturalLanguage = await llmService.isValidMoveText(move);
    const isAlgebraicNotation = /^[a-h][1-8][a-h][1-8]$|^[RNBQK]?[a-h]?[1-8]?x?[a-h][1-8]$|^O-O-?O?$/.test(move);
    
    if (isNaturalLanguage && !isAlgebraicNotation) {
      // Use LLM to convert natural language to move notation
      const convertedMove = await llmService.convertTextToMove(move, game.getGameState());
      
      if (!convertedMove) {
        return res.status(400).json({ 
          success: false, 
          error: 'Could not understand the move. Try using algebraic notation like "e2e4"' 
        });
      }
      
      moveNotation = convertedMove;
    }

    // Try to make the move
    let success = false;
    
    // First try as algebraic notation (e2e4 format)
    if (moveNotation.length === 4 && /^[a-h][1-8][a-h][1-8]$/.test(moveNotation)) {
      success = game.makeAlgebraicMove(moveNotation);
    } else {
      // Try to parse as standard algebraic notation
      success = game.makeAlgebraicMove(moveNotation);
    }

    if (success) {
      const gameState = game.getGameState();
      res.json({ 
        success: true, 
        gameState,
        originalMove: move,
        processedMove: moveNotation
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid move' 
      });
    }
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process move' 
    });
  }
});

// Reset game
router.post('/reset', (req, res) => {
  try {
    game.reset();
    const gameState = game.getGameState();
    res.json({ success: true, gameState });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset game' 
    });
  }
});

// Get move suggestions (optional feature)
router.post('/suggest', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Description is required' 
      });
    }

    const suggestion = await llmService.convertTextToMove(description, game.getGameState());
    
    if (suggestion) {
      res.json({ 
        success: true, 
        suggestion,
        description 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Could not generate move suggestion' 
      });
    }
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate suggestion' 
    });
  }
});

export default router;