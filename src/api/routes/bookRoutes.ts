import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();
const bookController = new BookController();

// Public routes
router.get('/', optionalAuth, bookController.getAllBooks);
router.get('/:id', optionalAuth, bookController.getBookById);

// Protected routes
router.post('/', authenticateToken, bookController.createBook);
router.put('/:id', authenticateToken, bookController.updateBook);
router.delete('/:id', authenticateToken, bookController.deleteBook);
router.get('/user/my-books', authenticateToken, bookController.getUserBooks);

export default router;