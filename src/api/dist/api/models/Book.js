"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Book extends sequelize_1.Model {
}
Book.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    author: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    coverImageUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        defaultValue: '/book-cover-default.png'
    },
    currentOwnerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isForSale: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isForTrade: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    priceValue: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    publicationYear: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1000,
            max: new Date().getFullYear() + 5
        }
    },
    genre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Другое'
    }
}, {
    sequelize: database_1.default,
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
});
exports.default = Book;
