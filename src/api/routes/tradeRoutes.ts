import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const tradeController = new TradeController();

router.get('/my-trades', authenticateToken, tradeController.getMyTrades);
router.get('/incoming', authenticateToken, tradeController.getIncomingTrades);
router.get('/outgoing', authenticateToken, tradeController.getOutgoingTrades);
router.post('/propose', authenticateToken, tradeController.proposeTrade);
router.put('/:id/respond', authenticateToken, tradeController.respondToTrade);
router.delete('/:id/cancel', authenticateToken, tradeController.cancelTrade);

export default router;