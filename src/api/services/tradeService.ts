import { TradeRepository } from '../repositories/tradeRepository';
import { BookRepository } from '../repositories/bookRepository';

export class TradeService {
  private tradeRepository = new TradeRepository();
  private bookRepository = new BookRepository();

  async getUserTrades(userId: string) {
    return await this.tradeRepository.findByUserId(userId);
  }

  async getIncomingTrades(userId: string) {
    return await this.tradeRepository.findIncomingTrades(userId);
  }

  async getOutgoingTrades(userId: string) {
    return await this.tradeRepository.findOutgoingTrades(userId);
  }

  async proposeTrade(initiatorId: string, initiatorBookId: string, recipientBookId: string) {
    // Получаем книги для проверки владельцев
    const initiatorBook = await this.bookRepository.findById(initiatorBookId);
    const recipientBook = await this.bookRepository.findById(recipientBookId);

    if (!initiatorBook || !recipientBook) {
      throw new Error('One or both books not found');
    }

    // Проверяем, что инициатор является владельцем своей книги
    if (initiatorBook.currentOwnerId !== initiatorId) {
      throw new Error('You can only propose trades with your own books');
    }

    // Получаем recipientId из книги
    const recipientId = recipientBook.currentOwnerId;

    // Проверяем, что обмен не предлагается самому себе
    if (initiatorId === recipientId) {
      throw new Error('Cannot propose trade to yourself');
    }

    // Проверяем, что книги доступны для обмена
    if (!initiatorBook.isForTrade || !recipientBook.isForTrade) {
      throw new Error('One or both books are not available for trade');
    }

    // Проверяем, нет ли уже активного обмена с этими книгами
    const existingTrade = await this.tradeRepository.checkExistingTrade(initiatorBookId, recipientBookId);
    if (existingTrade) {
      throw new Error('Trade with these books already exists');
    }

    return await this.tradeRepository.create({
      initiatorId,
      initiatorBookId,
      recipientId,
      recipientBookId,
      status: 'pending'
    });
  }

  async respondToTrade(tradeId: string, response: string, userId: string) {
    const trade = await this.tradeRepository.findById(tradeId);
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.recipientId !== userId) {
      throw new Error('Only recipient can respond to trade');
    }

    if (trade.status !== 'pending') {
      throw new Error('Trade is not pending');
    }

    return await this.tradeRepository.updateStatus(tradeId, response, userId);
  }

  async cancelTrade(tradeId: string, userId: string) {
    return await this.tradeRepository.cancel(tradeId, userId);
  }
}