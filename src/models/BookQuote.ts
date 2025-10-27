import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Book from './Book';

interface BookQuoteAttributes {
  id: string;
  text: string;
  bookId: string;
  quoterId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookQuoteCreationAttributes extends Optional<BookQuoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BookQuote extends Model<BookQuoteAttributes, BookQuoteCreationAttributes> implements BookQuoteAttributes {
  public id!: string;
  public text!: string;
  public bookId!: string;
  public quoterId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly quoter?: User;
  public readonly book?: Book;
}

BookQuote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000]
      }
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    quoterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'BookQuote',
    tableName: 'book_quotes',
    timestamps: true,
    indexes: [
      {
        fields: ['bookId']
      },
      {
        fields: ['quoterId']
      }
    ]
  }
);

export default BookQuote;