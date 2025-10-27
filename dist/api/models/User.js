"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 255]
        }
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 500.00,
        validate: {
            min: 0
        }
    },
    registrationDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    avatarUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        defaultValue: '/default-avatar.png'
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize: database_1.default,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});
exports.default = User;
