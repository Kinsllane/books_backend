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
    /**
     * СЛОЖНЫЙ ЗАПРОС 1: Получить популярные книги с количеством рецензий и цитат
     * Используется: LEFT JOIN, GROUP BY, COUNT, ORDER BY
     */
    async getPopularBooks(limit = 10) {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.genre,
        u.name as owner_name,
        COUNT(DISTINCT br.id) as review_count,
        COUNT(DISTINCT bq.id) as quote_count,
        COUNT(DISTINCT CASE WHEN br.id IS NOT NULL THEN br.id END) as total_engagement,
        b.created_at
      FROM books b
      LEFT JOIN users u ON b.current_owner_id = u.id
      LEFT JOIN book_reviews br ON b.id = br.book_id
      LEFT JOIN book_quotes bq ON b.id = bq.book_id
      GROUP BY b.id, b.title, b.author, b.genre, u.name, b.created_at
      HAVING COUNT(DISTINCT br.id) > 0 OR COUNT(DISTINCT bq.id) > 0
      ORDER BY total_engagement DESC, review_count DESC
      LIMIT :limit
    `, {
            replacements: { limit },
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 2: Получить активных авторов по количеству рецензий на их книги
     * Используется: JOIN, GROUP BY, HAVING, ORDER BY, подзапрос логики
     */
    async getMostReviewedAuthors(limit = 5) {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        b.author,
        COUNT(DISTINCT b.id) as book_count,
        COUNT(DISTINCT br.id) as total_reviews,
        ROUND(AVG(LENGTH(br.text))::numeric, 2) as avg_review_length,
        MAX(br.created_at) as last_review_date
      FROM books b
      LEFT JOIN book_reviews br ON b.id = br.book_id
      GROUP BY b.author
      HAVING COUNT(DISTINCT br.id) > 0
      ORDER BY total_reviews DESC, book_count DESC
      LIMIT :limit
    `, {
            replacements: { limit },
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 3: Получить активных пользователей с статистикой
     * Используется: Multiple LEFT JOINs, GROUP BY, COUNT, подсчёты по разным таблицам
     */
    async getActiveUsers(limit = 20) {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        u.id,
        u.name,
        u.balance,
        COUNT(DISTINCT b.id) as owned_books_count,
        COUNT(DISTINCT br.id) as reviews_written,
        COUNT(DISTINCT bq.id) as quotes_added,
        (COUNT(DISTINCT b.id) + COUNT(DISTINCT br.id) + COUNT(DISTINCT bq.id)) as total_activity,
        u.registration_date,
        u.role
      FROM users u
      LEFT JOIN books b ON u.id = b.current_owner_id
      LEFT JOIN book_reviews br ON u.id = br.reviewer_id
      LEFT JOIN book_quotes bq ON u.id = bq.quoter_id
      GROUP BY u.id, u.name, u.balance, u.registration_date, u.role
      HAVING COUNT(DISTINCT b.id) > 0 OR COUNT(DISTINCT br.id) > 0 OR COUNT(DISTINCT bq.id) > 0
      ORDER BY total_activity DESC, owned_books_count DESC
      LIMIT :limit
    `, {
            replacements: { limit },
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 4: Получить успешные обмены с информацией об участниках
     * Используется: Multiple JOINs, WHERE с условиями, ORDER BY
     */
    async getSuccessfulTrades() {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        bt.id as trade_id,
        u_init.name as initiator_name,
        u_rec.name as recipient_name,
        b_init.title as initiator_book_title,
        b_rec.title as recipient_book_title,
        bt.status,
        bt.created_at,
        bt.updated_at
      FROM book_trades bt
      INNER JOIN users u_init ON bt.initiator_id = u_init.id
      INNER JOIN users u_rec ON bt.recipient_id = u_rec.id
      INNER JOIN books b_init ON bt.initiator_book_id = b_init.id
      INNER JOIN books b_rec ON bt.recipient_book_id = b_rec.id
      WHERE bt.status = 'accepted'
      ORDER BY bt.updated_at DESC
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 5: Получить книги по жанрам с статус-статистикой
     * Используется: GROUP BY, COUNT с условиями, CASE WHEN, агрегация
     */
    async getGenreStatistics() {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        genre,
        COUNT(*) as total_books,
        COUNT(CASE WHEN is_for_sale = true THEN 1 END) as for_sale_count,
        COUNT(CASE WHEN is_for_trade = true THEN 1 END) as for_trade_count,
        ROUND(AVG(CASE WHEN price_value IS NOT NULL THEN price_value ELSE 0 END)::numeric, 2) as avg_price,
        COUNT(DISTINCT current_owner_id) as unique_owners
      FROM books
      GROUP BY genre
      ORDER BY total_books DESC
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 6: Получить книги, доступные для обмена с рейтингом активности
     * Используется: WHERE условия, GROUP BY, HAVING, подзапросы логики оценки
     */
    async getTradeAvailableBooks() {
        const result = await Book_1.default.sequelize?.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.genre,
        u.name as owner_name,
        COUNT(DISTINCT bt.id) as trade_requests_count,
        COUNT(CASE WHEN bt.status = 'accepted' THEN 1 END) as successful_trades,
        COUNT(DISTINCT br.id) as review_count,
        b.is_for_sale,
        b.price_value,
        b.created_at
      FROM books b
      INNER JOIN users u ON b.current_owner_id = u.id
      LEFT JOIN book_trades bt ON (b.id = bt.initiator_book_id OR b.id = bt.recipient_book_id)
      LEFT JOIN book_reviews br ON b.id = br.book_id
      WHERE b.is_for_trade = true
      GROUP BY b.id, b.title, b.author, b.genre, u.name, b.is_for_sale, b.price_value, b.created_at
      ORDER BY successful_trades DESC, trade_requests_count DESC, review_count DESC
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        return result || [];
    }
    /**
     * СЛОЖНЫЙ ЗАПРОС 7: Получить рекомендации книг на основе активности
     * Используется: Подзапросы, INNER JOINs, агрегирование
     */
    async getRecommendedBooks(genreFilter, limit = 10) {
        const whereCondition = genreFilter ? `AND b.genre = :genre` : '';
        const query = `
      SELECT DISTINCT b.*
      FROM books b
      INNER JOIN book_reviews br ON b.id = br.book_id
      INNER JOIN book_quotes bq ON b.id = bq.book_id
      WHERE (b.is_for_sale = true OR b.is_for_trade = true)
      ${whereCondition}
      ORDER BY br.created_at DESC, bq.created_at DESC
      LIMIT :limit
    `;
        const replacements = { limit };
        if (genreFilter)
            replacements.genre = genreFilter;
        const results = await Book_1.default.sequelize?.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT,
            mapToModel: true,
            model: Book_1.default
        });
        return results;
    }
}
exports.BookRepository = BookRepository;
