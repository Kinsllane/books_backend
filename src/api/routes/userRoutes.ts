import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateJWT } from '../middleware/passportAuth';
import { validate } from '../middleware/validation';
import { 
  getUserSchema, 
  updateProfileSchema, 
  topUpBalanceSchema, 
  deleteUserSchema 
} from '../validators/userValidator';

const router = Router();
const userController = new UserController();

router.get('/', authenticateJWT, userController.getAllUsers);
router.get('/profile', authenticateJWT, userController.getMyProfile);
router.get('/:id', authenticateJWT, validate(getUserSchema), userController.getUserById);
router.put('/profile', authenticateJWT, validate(updateProfileSchema), userController.updateProfile);
router.post('/balance/top-up', authenticateJWT, validate(topUpBalanceSchema), userController.topUpBalance);
router.delete('/:id', authenticateJWT, validate(deleteUserSchema), userController.deleteUser);

export default router;