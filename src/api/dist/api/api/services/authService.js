"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
class AuthService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    async register(username, password) {
        // Check if user exists
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await this.userRepository.create({
            name: username,
            password: hashedPassword,
            balance: 500,
            registrationDate: new Date().toISOString().split('T')[0],
            role: 'user',
            avatarUrl: '/default-avatar.png',
            bio: ''
        });
        // Generate token
        const token = this.generateToken(user.id);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return { user: userWithoutPassword, token };
    }
    async login(username, password) {
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return { user: userWithoutPassword, token };
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    }
}
exports.AuthService = AuthService;
