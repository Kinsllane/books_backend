import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await this.authService.register(username, password);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await this.authService.login(username, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };
}