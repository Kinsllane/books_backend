import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { authenticateJWT } from '../middleware/passportAuth';
import { validate } from '../middleware/validation';
import { 
  proposeTradeSchema, 
  respondToTradeSchema, 
  cancelTradeSchema 
} from '../validators/tradeValidator';

const router = Router();
const tradeController = new TradeController();

router.get('/my-trades', authenticateJWT, tradeController.getMyTrades);
router.get('/incoming', authenticateJWT, tradeController.getIncomingTrades);
router.get('/outgoing', authenticateJWT, tradeController.getOutgoingTrades);
router.post('/propose', authenticateJWT, validate(proposeTradeSchema), tradeController.proposeTrade);
router.put('/:id/respond', authenticateJWT, validate(respondToTradeSchema), tradeController.respondToTrade);
router.delete('/:id/cancel', authenticateJWT, validate(cancelTradeSchema), tradeController.cancelTrade);

export default router;