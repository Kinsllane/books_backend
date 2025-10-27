"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const bookService_1 = require("../services/bookService");
class BookController {
    constructor() {
        this.bookService = new bookService_1.BookService();
        this.getAllBooks = async (req, res) => {
            try {
                const { search, genre, forSale, forTrade } = req.query;
                const filters = {
                    search: search,
                    genre: genre,
                    forSale: forSale ? forSale === 'true' : undefined,
                    forTrade: forTrade ? forTrade === 'true' : undefined,
                };
                const books = await this.bookService.getAllBooks(filters);
                res.status(200).json(books);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.getBookById = async (req, res) => {
            try {
                const { id } = req.params;
                const book = await this.bookService.getBookById(id);
                res.status(200).json(book);
            }
            catch (error) {
                res.status(404).json({ error: error.message });
            }
        };
        this.createBook = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const book = await this.bookService.createBook(req.body, req.user.id);
                res.status(201).json(book);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.updateBook = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const { id } = req.params;
                const book = await this.bookService.updateBook(id, req.body, req.user.id);
                res.status(200).json(book);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.deleteBook = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const { id } = req.params;
                await this.bookService.deleteBook(id, req.user.id);
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.getUserBooks = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const books = await this.bookService.getUserBooks(req.user.id);
                res.status(200).json(books);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
    }
}
exports.BookController = BookController;
