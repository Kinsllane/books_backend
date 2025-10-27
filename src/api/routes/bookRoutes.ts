import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  createBookSchema, 
  updateBookSchema, 
  getBookSchema, 
  deleteBookSchema,
  getBooksQuerySchema 
} from '../validators/bookValidator';

const router = Router();
const bookController = new BookController();

// Public routes
router.get('/', validate(getBooksQuerySchema), optionalAuth, bookController.getAllBooks);
router.get('/:id', validate(getBookSchema), optionalAuth, bookController.getBookById);

// Protected routes
router.post('/', authenticateToken, validate(createBookSchema), bookController.createBook);
router.put('/:id', authenticateToken, validate(updateBookSchema), bookController.updateBook);
router.delete('/:id', authenticateToken, validate(deleteBookSchema), bookController.deleteBook);
router.get('/user/my-books', authenticateToken, bookController.getUserBooks);

export default router;