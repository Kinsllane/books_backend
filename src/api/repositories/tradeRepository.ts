import { Op, Transaction } from 'sequelize';
import BookTrade from '../../models/BookTrade';
import Book from '../../models/Book';
import User from '../../models/User';
import sequelize from '../../config/database';

export class TradeRepository {
  async findAll(): Promise<BookTrade[]> {
    return await BookTrade.findAll({
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: Book,
          as: 'initiatorBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        },
        {
          model: Book,
          as: 'recipientBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id: string): Promise<BookTrade | null> {
    return await BookTrade.findByPk(id, {
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: Book,
          as: 'initiatorBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        },
        {
          model: Book,
          as: 'recipientBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }
      ]
    });
  }

  async findByUserId(userId: string): Promise<BookTrade[]> {
    return await BookTrade.findAll({
      where: {
        [Op.or]: [
          { initiatorId: userId },
          { recipientId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: Book,
          as: 'initiatorBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        },
        {
          model: Book,
          as: 'recipientBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findIncomingTrades(userId: string): Promise<BookTrade[]> {
    return await BookTrade.findAll({
      where: {
        recipientId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: Book,
          as: 'initiatorBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        },
        {
          model: Book,
          as: 'recipientBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findOutgoingTrades(userId: string): Promise<BookTrade[]> {
    return await BookTrade.findAll({
      where: {
        initiatorId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatarUrl']
        },
        {
          model: Book,
          as: 'initiatorBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        },
        {
          model: Book,
          as: 'recipientBook',
          include: [{
            model: User,
            as: 'currentOwner',
            attributes: ['id', 'name', 'avatarUrl']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async create(tradeData: Partial<BookTrade>): Promise<BookTrade> {
    return await BookTrade.create(tradeData as any);
  }
  
  async updateStatus(id: string, status: string, userId: string): Promise<BookTrade | null> {
    const trade = await BookTrade.findByPk(id);
    if (!trade) return null;
  
    if (trade.recipientId !== userId && trade.initiatorId !== userId) {
      throw new Error('Not authorized to update this trade');
    }
  
    return await trade.update({ status: status as any });
  }

  async cancel(id: string, userId: string): Promise<boolean> {
    const trade = await BookTrade.findByPk(id);
    if (!trade) return false;

    // Только инициатор может отменить обмен
    if (trade.initiatorId !== userId) {
      throw new Error('Only trade initiator can cancel the trade');
    }

    if (trade.status !== 'pending') {
      throw new Error('Only pending trades can be cancelled');
    }

    const deleted = await BookTrade.destroy({ where: { id } });
    return deleted > 0;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await BookTrade.destroy({ where: { id } });
    return deleted > 0;
  }

  async checkExistingTrade(initiatorBookId: string, recipientBookId: string): Promise<boolean> {
    const existingTrade = await BookTrade.findOne({
      where: {
        [Op.or]: [
          {
            initiatorBookId,
            recipientBookId,
            status: 'pending'
          },
          {
            initiatorBookId: recipientBookId,
            recipientBookId: initiatorBookId,
            status: 'pending'
          }
        ]
      }
    });

    return !!existingTrade;
  }

  /**
   * Завершение обмена с транзакционной защитой
   * Использует SERIALIZABLE isolation level для предотвращения deadlock
   */
  async completeTradeWithTransaction(tradeId: string): Promise<BookTrade | null> {
    return await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, async (t) => {
      const trade = await BookTrade.findByPk(tradeId, {
        lock: true, // Блокируем строку
        transaction: t
      });

      if (!trade || trade.status !== 'pending') {
        throw new Error('Trade not found or not pending');
      }

      // Получаем книги с блокировкой
      const initiatorBook = await Book.findByPk(trade.initiatorBookId, {
        lock: true,
        transaction: t
      });

      const recipientBook = await Book.findByPk(trade.recipientBookId, {
        lock: true,
        transaction: t
      });

      if (!initiatorBook || !recipientBook) {
        throw new Error('One or both books not found');
      }

      // Меняем владельцев в транзакции
      const initiatorOwnerId = initiatorBook.currentOwnerId;
      const recipientOwnerId = recipientBook.currentOwnerId;

      await Book.update(
        { currentOwnerId: recipientOwnerId },
        { where: { id: trade.initiatorBookId }, transaction: t }
      );

      await Book.update(
        { currentOwnerId: initiatorOwnerId },
        { where: { id: trade.recipientBookId }, transaction: t }
      );

      // Обновляем статус обмена
      await trade.update({ status: 'completed' }, { transaction: t });

      return await BookTrade.findByPk(tradeId, { transaction: t });
    });
  }
}