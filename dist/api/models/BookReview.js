"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class BookReview extends sequelize_1.Model {
}
BookReview.init({
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
            len: [1, 2000]
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
    reviewerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize: database_1.default,
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
});
exports.default = BookReview;
