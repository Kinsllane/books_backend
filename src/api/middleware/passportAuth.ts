import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import User from '../../models/User';

// Middleware для обязательной аутентификации
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      res.status(500).json({ error: 'Authentication error' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Middleware для опциональной аутентификации
export const optionalAuthPassport = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Middleware для проверки роли администратора
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as any;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};
