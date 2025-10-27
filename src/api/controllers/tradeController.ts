import { Request, Response } from 'express';
import { TradeService } from '../services/tradeService';

export class TradeController {
  private tradeService = new TradeService();

  getMyTrades = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const trades = await this.tradeService.getUserTrades(authUser.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getIncomingTrades = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const trades = await this.tradeService.getIncomingTrades(authUser.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getOutgoingTrades = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const trades = await this.tradeService.getOutgoingTrades(authUser.id);
      res.status(200).json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  proposeTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const { initiatorBookId, recipientBookId } = req.body;
      const trade = await this.tradeService.proposeTrade(
        authUser.id,
        initiatorBookId,
        recipientBookId
      );
      res.status(201).json(trade);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  respondToTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const { id } = req.params;
      const { response } = req.body; // 'accepted' | 'rejected'
      const result = await this.tradeService.respondToTrade(id, response, authUser.id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const authUser = req.user as any;
      const { id } = req.params;
      await this.tradeService.cancelTrade(id, authUser.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}