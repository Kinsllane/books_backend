import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

export class AuthService {
  private userRepository = new UserRepository();

  async register(username: string, password: string): Promise<{ user: any; token: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.userRepository.create({
      name: username,
      password: hashedPassword,
      balance: 500,
      registrationDate: new Date().toISOString().split('T')[0],
      role: 'user',
      avatarUrl: '/default-avatar.png',
      bio: ''
    });

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return { user: userWithoutPassword, token };
  }

  async login(username: string, password: string): Promise<{ user: any; token: string }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return { user: userWithoutPassword, token };
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
  }
}