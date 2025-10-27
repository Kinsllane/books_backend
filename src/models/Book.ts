import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface BookAttributes {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  currentOwnerId: string;
  isForSale: boolean;
  isForTrade: boolean;
  priceValue?: number;
  publicationYear: number;
  genre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'priceValue' | 'createdAt' | 'updatedAt'> {}

class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  public id!: string;
  public title!: string;
  public author!: string;
  public description!: string;
  public coverImageUrl!: string;
  public currentOwnerId!: string;
  public isForSale!: boolean;
  public isForTrade!: boolean;
  public priceValue?: number;
  public publicationYear!: number;
  public genre!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly currentOwner?: User;
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '/book-cover-default.png'
    },
    currentOwnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isForSale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isForTrade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    priceValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1000,
        max: new Date().getFullYear() + 5
      }
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Другое'
    }
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    timestamps: true,
    indexes: [
      {
        fields: ['title']
      },
      {
        fields: ['author']
      },
      {
        fields: ['genre']
      },
      {
        fields: ['currentOwnerId']
      }
    ]
  }
);

export default Book;