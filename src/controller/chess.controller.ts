import type { Request, Response } from "express";
import { ChessGame } from "../lib/chess.js";
import { LLMService } from "../lib/llm-service.js";

const game = new ChessGame();
const llmService = new LLMService();

export const getStateController = (req: Request, res: Response) => {
  try {
    const gameState = game.getGameState();
    res.json(gameState);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game state' });
  }
}

export const movePieceController = async (req: Request, res: Response) => {
  try {
    const { move } = req.body;

    if (!move || typeof move !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Move is required and must be a string'
      });
      return;
    }

    let moveNotation = move;

    const isNaturalLanguage = await llmService.isValidMoveText(move);
    const isAlgebraicNotation = /^[a-h][1-8][a-h][1-8]$|^[RNBQK]?[a-h]?[1-8]?x?[a-h][1-8]$|^O-O-?O?$/.test(move);

    if (isNaturalLanguage && !isAlgebraicNotation) {
      const convertedMove = await llmService.convertTextToMove(move, game.getGameState());

      if (!convertedMove) {
        res.status(400).json({
          success: false,
          error: 'Could not understand the move. Try using algebraic notation like "e2e4"'
        });
        return;
      }

      moveNotation = convertedMove;
    }

    let success = false;

    if (moveNotation.length === 4 && /^[a-h][1-8][a-h][1-8]$/.test(moveNotation)) {
      success = game.makeAlgebraicMove(moveNotation);
    } else {
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
    res.status(500).json({
      success: false,
      error: 'Failed to process move'
    });
  }
}

export const resetGameController = (req: Request, res: Response) => {
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
}

export const suggestMoveController = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      res.status(400).json({
        success: false,
        error: 'Description is required'
      });
      return;
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
};
