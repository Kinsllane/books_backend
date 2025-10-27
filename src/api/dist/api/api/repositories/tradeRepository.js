"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeRepository = void 0;
const sequelize_1 = require("sequelize");
const BookTrade_1 = __importDefault(require("../../models/BookTrade"));
const Book_1 = __importDefault(require("../../models/Book"));
const User_1 = __importDefault(require("../../models/User"));
class TradeRepository {
    async findAll() {
        return await BookTrade_1.default.findAll({
            include: [
                {
                    model: User_1.default,
                    as: 'initiator',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: User_1.default,
                    as: 'recipient',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: Book_1.default,
                    as: 'initiatorBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                },
                {
                    model: Book_1.default,
                    as: 'recipientBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async findById(id) {
        return await BookTrade_1.default.findByPk(id, {
            include: [
                {
                    model: User_1.default,
                    as: 'initiator',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: User_1.default,
                    as: 'recipient',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: Book_1.default,
                    as: 'initiatorBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                },
                {
                    model: Book_1.default,
                    as: 'recipientBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                }
            ]
        });
    }
    async findByUserId(userId) {
        return await BookTrade_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { initiatorId: userId },
                    { recipientId: userId }
                ]
            },
            include: [
                {
                    model: User_1.default,
                    as: 'initiator',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: User_1.default,
                    as: 'recipient',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: Book_1.default,
                    as: 'initiatorBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                },
                {
                    model: Book_1.default,
                    as: 'recipientBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async findIncomingTrades(userId) {
        return await BookTrade_1.default.findAll({
            where: {
                recipientId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: User_1.default,
                    as: 'initiator',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: Book_1.default,
                    as: 'initiatorBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                },
                {
                    model: Book_1.default,
                    as: 'recipientBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async findOutgoingTrades(userId) {
        return await BookTrade_1.default.findAll({
            where: {
                initiatorId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: User_1.default,
                    as: 'recipient',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: Book_1.default,
                    as: 'initiatorBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                },
                {
                    model: Book_1.default,
                    as: 'recipientBook',
                    include: [{
                            model: User_1.default,
                            as: 'currentOwner',
                            attributes: ['id', 'name', 'avatarUrl']
                        }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async create(tradeData) {
        return await BookTrade_1.default.create(tradeData);
    }
    async updateStatus(id, status, userId) {
        const trade = await BookTrade_1.default.findByPk(id);
        if (!trade)
            return null;
        if (trade.recipientId !== userId && trade.initiatorId !== userId) {
            throw new Error('Not authorized to update this trade');
        }
        return await trade.update({ status: status });
    }
    async cancel(id, userId) {
        const trade = await BookTrade_1.default.findByPk(id);
        if (!trade)
            return false;
        // Только инициатор может отменить обмен
        if (trade.initiatorId !== userId) {
            throw new Error('Only trade initiator can cancel the trade');
        }
        if (trade.status !== 'pending') {
            throw new Error('Only pending trades can be cancelled');
        }
        const deleted = await BookTrade_1.default.destroy({ where: { id } });
        return deleted > 0;
    }
    async delete(id) {
        const deleted = await BookTrade_1.default.destroy({ where: { id } });
        return deleted > 0;
    }
    async checkExistingTrade(initiatorBookId, recipientBookId) {
        const existingTrade = await BookTrade_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
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
}
exports.TradeRepository = TradeRepository;
