import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TradeService } from '../services/tradeService';

export class TradeController {
  private tradeService = new TradeService();

  getMyTrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const trades = await this.tradeService.getUserTrades(req.user.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getIncomingTrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const trades = await this.tradeService.getIncomingTrades(req.user.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getOutgoingTrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const trades = await this.tradeService.getOutgoingTrades(req.user.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  proposeTrade = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { initiatorBookId, recipientBookId } = req.body;
      const trade = await this.tradeService.proposeTrade(
        req.user.id,
        initiatorBookId,
        recipientBookId
      );
      res.status(201).json(trade);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  respondToTrade = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      const { response } = req.body; // 'accepted' | 'rejected'
      const result = await this.tradeService.respondToTrade(id, response, req.user.id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelTrade = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      await this.tradeService.cancelTrade(id, req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}