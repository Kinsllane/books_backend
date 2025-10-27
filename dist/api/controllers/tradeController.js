"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeController = void 0;
const tradeService_1 = require("../services/tradeService");
class TradeController {
    constructor() {
        this.tradeService = new tradeService_1.TradeService();
        this.getMyTrades = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const trades = await this.tradeService.getUserTrades(authUser.id);
                res.status(200).json(trades);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.getIncomingTrades = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const trades = await this.tradeService.getIncomingTrades(authUser.id);
                res.status(200).json(trades);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.getOutgoingTrades = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const trades = await this.tradeService.getOutgoingTrades(authUser.id);
                res.status(200).json(trades);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.proposeTrade = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const { initiatorBookId, recipientBookId } = req.body;
                const trade = await this.tradeService.proposeTrade(authUser.id, initiatorBookId, recipientBookId);
                res.status(201).json(trade);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.respondToTrade = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const { id } = req.params;
                const { response } = req.body; // 'accepted' | 'rejected'
                const result = await this.tradeService.respondToTrade(id, response, authUser.id);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.cancelTrade = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const { id } = req.params;
                await this.tradeService.cancelTrade(id, authUser.id);
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
    }
}
exports.TradeController = TradeController;
