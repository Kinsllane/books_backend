"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookRepository = void 0;
const sequelize_1 = require("sequelize");
const Book_1 = __importDefault(require("../../models/Book"));
const User_1 = __importDefault(require("../../models/User"));
class BookRepository {
    async findAll(filters = {}) {
        const where = {};
        if (filters.search) {
            where[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
                { author: { [sequelize_1.Op.iLike]: `%${filters.search}%` } }
            ];
        }
        if (filters.genre)
            where.genre = filters.genre;
        if (filters.forSale !== undefined)
            where.isForSale = filters.forSale;
        if (filters.forTrade !== undefined)
            where.isForTrade = filters.forTrade;
        if (filters.ownerId)
            where.currentOwnerId = filters.ownerId;
        return await Book_1.default.findAll({
            where,
            include: [{
                    model: User_1.default,
                    as: 'currentOwner',
                    attributes: ['id', 'name', 'avatarUrl']
                }],
            order: [['createdAt', 'DESC']]
        });
    }
    async findById(id) {
        return await Book_1.default.findByPk(id, {
            include: [{
                    model: User_1.default,
                    as: 'currentOwner',
                    attributes: ['id', 'name', 'avatarUrl']
                }]
        });
    }
    async create(bookData) {
        return await Book_1.default.create(bookData);
    }
    async update(id, bookData) {
        const book = await Book_1.default.findByPk(id);
        if (!book)
            return null;
        return await book.update(bookData);
    }
    async delete(id) {
        const deleted = await Book_1.default.destroy({ where: { id } });
        return deleted > 0;
    }
    async findByOwner(ownerId) {
        return await Book_1.default.findAll({
            where: { currentOwnerId: ownerId },
            include: [{
                    model: User_1.default,
                    as: 'currentOwner',
                    attributes: ['id', 'name', 'avatarUrl']
                }]
        });
    }
}
exports.BookRepository = BookRepository;
