import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.get('/', authenticateToken, userController.getAllUsers);
router.get('/profile', authenticateToken, userController.getMyProfile);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/balance/top-up', authenticateToken, userController.topUpBalance);
router.delete('/:id', authenticateToken, userController.deleteUser);

export default router;