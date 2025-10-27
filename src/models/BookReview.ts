import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Book from './Book';

interface BookReviewAttributes {
  id: string;
  text: string;
  bookId: string;
  reviewerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookReviewCreationAttributes extends Optional<BookReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BookReview extends Model<BookReviewAttributes, BookReviewCreationAttributes> implements BookReviewAttributes {
  public id!: string;
  public text!: string;
  public bookId!: string;
  public reviewerId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly reviewer?: User;
  public readonly book?: Book;
}

BookReview.init(
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
        len: [1, 2000]
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
    reviewerId: {
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
    modelName: 'BookReview',
    tableName: 'book_reviews',
    timestamps: true,
    indexes: [
      {
        fields: ['bookId']
      },
      {
        fields: ['reviewerId']
      }
    ]
  }
);

export default BookReview;