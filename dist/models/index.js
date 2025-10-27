"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookTrade = exports.BookQuote = exports.BookReview = exports.Book = exports.User = exports.sequelize = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Book_1 = __importDefault(require("./Book"));
exports.Book = Book_1.default;
const BookReview_1 = __importDefault(require("./BookReview"));
exports.BookReview = BookReview_1.default;
const BookQuote_1 = __importDefault(require("./BookQuote"));
exports.BookQuote = BookQuote_1.default;
const BookTrade_1 = __importDefault(require("./BookTrade"));
exports.BookTrade = BookTrade_1.default;
// Ассоциации User - Book (One-to-Many)
User_1.default.hasMany(Book_1.default, {
    foreignKey: 'currentOwnerId',
    as: 'books'
});
Book_1.default.belongsTo(User_1.default, {
    foreignKey: 'currentOwnerId',
    as: 'currentOwner'
});
// Ассоциации Book - BookReview (One-to-Many)
Book_1.default.hasMany(BookReview_1.default, {
    foreignKey: 'bookId',
    as: 'reviews'
});
BookReview_1.default.belongsTo(Book_1.default, {
    foreignKey: 'bookId',
    as: 'book'
});
// Ассоциации User - BookReview (One-to-Many)
User_1.default.hasMany(BookReview_1.default, {
    foreignKey: 'reviewerId',
    as: 'reviews'
});
BookReview_1.default.belongsTo(User_1.default, {
    foreignKey: 'reviewerId',
    as: 'reviewer'
});
// Ассоциации Book - BookQuote (One-to-Many)
Book_1.default.hasMany(BookQuote_1.default, {
    foreignKey: 'bookId',
    as: 'quotes'
});
BookQuote_1.default.belongsTo(Book_1.default, {
    foreignKey: 'bookId',
    as: 'book'
});
// Ассоциации User - BookQuote (One-to-Many)
User_1.default.hasMany(BookQuote_1.default, {
    foreignKey: 'quoterId',
    as: 'quotes'
});
BookQuote_1.default.belongsTo(User_1.default, {
    foreignKey: 'quoterId',
    as: 'quoter'
});
// Ассоциации для BookTrade
User_1.default.hasMany(BookTrade_1.default, {
    foreignKey: 'initiatorId',
    as: 'initiatedTrades'
});
BookTrade_1.default.belongsTo(User_1.default, {
    foreignKey: 'initiatorId',
    as: 'initiator'
});
User_1.default.hasMany(BookTrade_1.default, {
    foreignKey: 'recipientId',
    as: 'receivedTrades'
});
BookTrade_1.default.belongsTo(User_1.default, {
    foreignKey: 'recipientId',
    as: 'recipient'
});
Book_1.default.hasMany(BookTrade_1.default, {
    foreignKey: 'initiatorBookId',
    as: 'tradesAsInitiatorBook'
});
BookTrade_1.default.belongsTo(Book_1.default, {
    foreignKey: 'initiatorBookId',
    as: 'initiatorBook'
});
Book_1.default.hasMany(BookTrade_1.default, {
    foreignKey: 'recipientBookId',
    as: 'tradesAsRecipientBook'
});
BookTrade_1.default.belongsTo(Book_1.default, {
    foreignKey: 'recipientBookId',
    as: 'recipientBook'
});
