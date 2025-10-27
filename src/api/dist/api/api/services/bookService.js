"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const bookRepository_1 = require("../repositories/bookRepository");
const userRepository_1 = require("../repositories/userRepository");
class BookService {
    constructor() {
        this.bookRepository = new bookRepository_1.BookRepository();
        this.userRepository = new userRepository_1.UserRepository();
    }
    async getAllBooks(filters) {
        return await this.bookRepository.findAll(filters);
    }
    async getBookById(id) {
        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        return book;
    }
    async createBook(bookData, ownerId) {
        const owner = await this.userRepository.findById(ownerId);
        if (!owner) {
            throw new Error('Owner not found');
        }
        return await this.bookRepository.create({
            ...bookData,
            currentOwnerId: ownerId
        });
    }
    async updateBook(id, bookData, userId) {
        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        // Check ownership or admin role
        const user = await this.userRepository.findById(userId);
        if (book.currentOwnerId !== userId && user?.role !== 'admin') {
            throw new Error('Not authorized to update this book');
        }
        return await this.bookRepository.update(id, bookData);
    }
    async deleteBook(id, userId) {
        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        const user = await this.userRepository.findById(userId);
        if (book.currentOwnerId !== userId && user?.role !== 'admin') {
            throw new Error('Not authorized to delete this book');
        }
        return await this.bookRepository.delete(id);
    }
    async getUserBooks(userId) {
        return await this.bookRepository.findByOwner(userId);
    }
}
exports.BookService = BookService;
