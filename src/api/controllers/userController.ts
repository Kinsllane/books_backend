import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/userService';

export class UserController {
  private userService = new UserService();

  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const user = await this.userService.getUserById(req.user.id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const user = await this.userService.updateUser(req.user.id, req.body);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  topUpBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { amount } = req.body;
      const user = await this.userService.topUpBalance(req.user.id, amount);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      await this.userService.deleteUser(id, req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}