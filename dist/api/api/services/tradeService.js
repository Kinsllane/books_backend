"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeService = void 0;
const tradeRepository_1 = require("../repositories/tradeRepository");
class TradeService {
    constructor() {
        this.tradeRepository = new tradeRepository_1.TradeRepository();
    }
    async getUserTrades(userId) {
        return await this.tradeRepository.findByUserId(userId);
    }
    async getIncomingTrades(userId) {
        return await this.tradeRepository.findIncomingTrades(userId);
    }
    async getOutgoingTrades(userId) {
        return await this.tradeRepository.findOutgoingTrades(userId);
    }
    async proposeTrade(initiatorId, initiatorBookId, recipientBookId) {
        return await this.tradeRepository.create({
            initiatorId,
            initiatorBookId,
            recipientBookId,
            status: 'pending'
        });
    }
    async respondToTrade(tradeId, response, userId) {
        return await this.tradeRepository.updateStatus(tradeId, response, userId);
    }
    async cancelTrade(tradeId, userId) {
        return await this.tradeRepository.cancel(tradeId, userId);
    }
}
exports.TradeService = TradeService;
