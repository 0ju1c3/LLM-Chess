import { Router } from 'express';
import { getStateController, movePieceController, resetGameController, suggestMoveController } from '../controller/chess.controller.js';

const gameRouter = Router();

gameRouter.get('/state', getStateController);
gameRouter.post('/move', movePieceController);
gameRouter.post('/reset', resetGameController);
gameRouter.post('/suggest', suggestMoveController);

export default gameRouter;