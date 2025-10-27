"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class BookTrade extends sequelize_1.Model {
}
BookTrade.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    initiatorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    initiatorBookId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    recipientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    recipientBookId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    sequelize: database_1.default,
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
});
exports.default = BookTrade;
