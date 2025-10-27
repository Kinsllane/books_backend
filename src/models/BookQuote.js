"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class BookQuote extends sequelize_1.Model {
}
BookQuote.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 1000]
        }
    },
    bookId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    quoterId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize: database_1.default,
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
});
exports.default = BookQuote;
