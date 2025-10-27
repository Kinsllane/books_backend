"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const bookController = new bookController_1.BookController();
// Public routes
router.get('/', auth_1.optionalAuth, bookController.getAllBooks);
router.get('/:id', auth_1.optionalAuth, bookController.getBookById);
// Protected routes
router.post('/', auth_1.authenticateToken, bookController.createBook);
router.put('/:id', auth_1.authenticateToken, bookController.updateBook);
router.delete('/:id', auth_1.authenticateToken, bookController.deleteBook);
router.get('/user/my-books', auth_1.authenticateToken, bookController.getUserBooks);
exports.default = router;
