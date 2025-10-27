import { UserRepository } from '../repositories/userRepository';
import { BookRepository } from '../repositories/bookRepository';

export class UserService {
  private userRepository = new UserRepository();
  private bookRepository = new BookRepository();

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id: string, userData: any) {
    return await this.userRepository.update(id, userData);
  }

  async topUpBalance(id: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    return await this.userRepository.updateBalance(id, amount);
  }

  async deleteUser(id: string, currentUserId: string) {
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admin can delete users');
    }

    if (id === currentUserId) {
      throw new Error('Cannot delete yourself');
    }

    return await this.userRepository.delete(id);
  }

  async getUserBooks(userId: string) {
    return await this.bookRepository.findByOwner(userId);
  }
}