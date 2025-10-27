import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  proposeTradeSchema, 
  respondToTradeSchema, 
  cancelTradeSchema 
} from '../validators/tradeValidator';

const router = Router();
const tradeController = new TradeController();

router.get('/my-trades', authenticateToken, tradeController.getMyTrades);
router.get('/incoming', authenticateToken, tradeController.getIncomingTrades);
router.get('/outgoing', authenticateToken, tradeController.getOutgoingTrades);
router.post('/propose', authenticateToken, validate(proposeTradeSchema), tradeController.proposeTrade);
router.put('/:id/respond', authenticateToken, validate(respondToTradeSchema), tradeController.respondToTrade);
router.delete('/:id/cancel', authenticateToken, validate(cancelTradeSchema), tradeController.cancelTrade);

export default router;