import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Book from './Book';

interface BookTradeAttributes {
  id: string;
  initiatorId: string;
  initiatorBookId: string;
  recipientId: string;
  recipientBookId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookTradeCreationAttributes extends Optional<BookTradeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BookTrade extends Model<BookTradeAttributes, BookTradeCreationAttributes> implements BookTradeAttributes {
  public id!: string;
  public initiatorId!: string;
  public initiatorBookId!: string;
  public recipientId!: string;
  public recipientBookId!: string;
  public status!: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly initiator?: User;
  public readonly recipient?: User;
  public readonly initiatorBook?: Book;
  public readonly recipientBook?: Book;
}

BookTrade.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    initiatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    initiatorBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipientBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    modelName: 'BookTrade',
    tableName: 'book_trades',
    timestamps: true,
    indexes: [
      {
        fields: ['initiatorId']
      },
      {
        fields: ['recipientId']
      },
      {
        fields: ['status']
      }
    ]
  }
);

export default BookTrade;