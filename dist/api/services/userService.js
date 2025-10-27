"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const bookRepository_1 = require("../repositories/bookRepository");
class UserService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
        this.bookRepository = new bookRepository_1.BookRepository();
    }
    async getAllUsers() {
        return await this.userRepository.findAll();
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(id, userData) {
        return await this.userRepository.update(id, userData);
    }
    async topUpBalance(id, amount) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        return await this.userRepository.updateBalance(id, amount);
    }
    async deleteUser(id, currentUserId) {
        const currentUser = await this.userRepository.findById(currentUserId);
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Only admin can delete users');
        }
        if (id === currentUserId) {
            throw new Error('Cannot delete yourself');
        }
        return await this.userRepository.delete(id);
    }
    async getUserBooks(userId) {
        return await this.bookRepository.findByOwner(userId);
    }
}
exports.UserService = UserService;
