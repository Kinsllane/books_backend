import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Book from './Book';

/**
 * МОДЕЛЬ: Transaction (Транзакции)
 * 
 * Таблица для отслеживания всех финансовых операций в системе.
 * Демонстрирует расширенную модель данных для курсовой работы.
 * 
 * Типы транзакций:
 * - BOOK_PURCHASE: Покупка книги
 * - BOOK_SALE: Продажа книги
 * - REFUND: Возврат средств
 * - COMMISSION: Комиссия за обмен
 * 
 * Статусы:
 * - pending: В ожидании (например, ожидание подтверждения)
 * - completed: Завершена успешно
 * - failed: Ошибка при обработке
 * - cancelled: Отменена пользователем
 */

interface TransactionAttributes {
  id: string;
  type: 'BOOK_PURCHASE' | 'BOOK_SALE' | 'REFUND' | 'COMMISSION';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fromUserId: string;
  toUserId: string;
  bookId?: string;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'metadata' | 'description' | 'bookId' | 'createdAt' | 'updatedAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public type!: 'BOOK_PURCHASE' | 'BOOK_SALE' | 'REFUND' | 'COMMISSION';
  public status!: 'pending' | 'completed' | 'failed' | 'cancelled';
  public fromUserId!: string;
  public toUserId!: string;
  public bookId?: string;
  public amount!: number;
  public description?: string;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly fromUser?: User;
  public readonly toUser?: User;
  public readonly book?: Book;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('BOOK_PURCHASE', 'BOOK_SALE', 'REFUND', 'COMMISSION'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
        isNumeric: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    }
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['fromUserId']
      },
      {
        fields: ['toUserId']
      },
      {
        fields: ['bookId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      },
      {
        // Составной индекс для быстрого поиска транзакций пользователя по статусу
        fields: ['fromUserId', 'status']
      },
      {
        // Составной индекс для отчётов по периодам
        fields: ['createdAt', 'type']
      }
    ],
    validate: {
      // CHECK constraint: Отправитель и получатель не могут быть одним лицом
      differentUsers(this: any) {
        if (this.fromUserId === this.toUserId) {
          throw new Error('Отправитель и получатель не могут быть одним и тем же пользователем');
        }
      },
      // CHECK constraint: Сумма должна быть положительной
      validAmount(this: any) {
        if (this.amount <= 0) {
          throw new Error('Сумма транзакции должна быть положительной');
        }
      }
    }
  }
);

export default Transaction;
