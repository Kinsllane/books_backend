import User from '../../models/User';
import { Op } from 'sequelize';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { name: username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    return await User.create(userData as any);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    return await user.update(userData);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  }

  async updateBalance(id: string, amount: number): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    user.balance += amount;
    return await user.save();
  }
}