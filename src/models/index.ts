import sequelize from '../config/database';
import User from './User';
import Book from './Book';
import BookReview from './BookReview';
import BookQuote from './BookQuote';
import BookTrade from './BookTrade';
import Transaction from './Transaction';

// Ассоциации User - Book (One-to-Many)
User.hasMany(Book, {
  foreignKey: 'currentOwnerId',
  as: 'books'
});
Book.belongsTo(User, {
  foreignKey: 'currentOwnerId',
  as: 'currentOwner'
});

// Ассоциации Book - BookReview (One-to-Many)
Book.hasMany(BookReview, {
  foreignKey: 'bookId',
  as: 'reviews'
});
BookReview.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});

// Ассоциации User - BookReview (One-to-Many)
User.hasMany(BookReview, {
  foreignKey: 'reviewerId',
  as: 'reviews'
});
BookReview.belongsTo(User, {
  foreignKey: 'reviewerId',
  as: 'reviewer'
});

// Ассоциации Book - BookQuote (One-to-Many)
Book.hasMany(BookQuote, {
  foreignKey: 'bookId',
  as: 'quotes'
});
BookQuote.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});

// Ассоциации User - BookQuote (One-to-Many)
User.hasMany(BookQuote, {
  foreignKey: 'quoterId',
  as: 'quotes'
});
BookQuote.belongsTo(User, {
  foreignKey: 'quoterId',
  as: 'quoter'
});

// Ассоциации для BookTrade
User.hasMany(BookTrade, {
  foreignKey: 'initiatorId',
  as: 'initiatedTrades'
});
BookTrade.belongsTo(User, {
  foreignKey: 'initiatorId',
  as: 'initiator'
});

User.hasMany(BookTrade, {
  foreignKey: 'recipientId',
  as: 'receivedTrades'
});
BookTrade.belongsTo(User, {
  foreignKey: 'recipientId',
  as: 'recipient'
});

Book.hasMany(BookTrade, {
  foreignKey: 'initiatorBookId',
  as: 'tradesAsInitiatorBook'
});
BookTrade.belongsTo(Book, {
  foreignKey: 'initiatorBookId',
  as: 'initiatorBook'
});

Book.hasMany(BookTrade, {
  foreignKey: 'recipientBookId',
  as: 'tradesAsRecipientBook'
});
BookTrade.belongsTo(Book, {
  foreignKey: 'recipientBookId',
  as: 'recipientBook'
});

// Ассоциации для Transaction (One-to-Many)
User.hasMany(Transaction, {
  foreignKey: 'fromUserId',
  as: 'sentTransactions'
});
Transaction.belongsTo(User, {
  foreignKey: 'fromUserId',
  as: 'fromUser'
});

User.hasMany(Transaction, {
  foreignKey: 'toUserId',
  as: 'receivedTransactions'
});
Transaction.belongsTo(User, {
  foreignKey: 'toUserId',
  as: 'toUser'
});

Book.hasMany(Transaction, {
  foreignKey: 'bookId',
  as: 'transactions'
});
Transaction.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});

export {
  sequelize,
  User,
  Book,
  BookReview,
  BookQuote,
  BookTrade,
  Transaction
};