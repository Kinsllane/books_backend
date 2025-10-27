"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const bookValidator_1 = require("../validators/bookValidator");
const router = (0, express_1.Router)();
const bookController = new bookController_1.BookController();
// Public routes
router.get('/', (0, validation_1.validate)(bookValidator_1.getBooksQuerySchema), auth_1.optionalAuth, bookController.getAllBooks);
router.get('/:id', (0, validation_1.validate)(bookValidator_1.getBookSchema), auth_1.optionalAuth, bookController.getBookById);
// Protected routes
router.post('/', auth_1.authenticateToken, (0, validation_1.validate)(bookValidator_1.createBookSchema), bookController.createBook);
router.put('/:id', auth_1.authenticateToken, (0, validation_1.validate)(bookValidator_1.updateBookSchema), bookController.updateBook);
router.delete('/:id', auth_1.authenticateToken, (0, validation_1.validate)(bookValidator_1.deleteBookSchema), bookController.deleteBook);
router.get('/user/my-books', auth_1.authenticateToken, bookController.getUserBooks);
exports.default = router;
