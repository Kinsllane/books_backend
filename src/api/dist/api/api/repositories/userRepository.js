"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = __importDefault(require("../../models/User"));
class UserRepository {
    async findAll() {
        return await User_1.default.findAll();
    }
    async findById(id) {
        return await User_1.default.findByPk(id);
    }
    async findByUsername(username) {
        return await User_1.default.findOne({ where: { name: username } });
    }
    async create(userData) {
        return await User_1.default.create(userData);
    }
    async update(id, userData) {
        const user = await User_1.default.findByPk(id);
        if (!user)
            return null;
        return await user.update(userData);
    }
    async delete(id) {
        const deleted = await User_1.default.destroy({ where: { id } });
        return deleted > 0;
    }
    async updateBalance(id, amount) {
        const user = await User_1.default.findByPk(id);
        if (!user)
            return null;
        user.balance += amount;
        return await user.save();
    }
}
exports.UserRepository = UserRepository;
