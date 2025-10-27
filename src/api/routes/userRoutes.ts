import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  getUserSchema, 
  updateProfileSchema, 
  topUpBalanceSchema, 
  deleteUserSchema 
} from '../validators/userValidator';

const router = Router();
const userController = new UserController();

router.get('/', authenticateToken, userController.getAllUsers);
router.get('/profile', authenticateToken, userController.getMyProfile);
router.get('/:id', authenticateToken, validate(getUserSchema), userController.getUserById);
router.put('/profile', authenticateToken, validate(updateProfileSchema), userController.updateProfile);
router.post('/balance/top-up', authenticateToken, validate(topUpBalanceSchema), userController.topUpBalance);
router.delete('/:id', authenticateToken, validate(deleteUserSchema), userController.deleteUser);

export default router;