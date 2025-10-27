import { BookRepository } from '../repositories/bookRepository';
import { UserRepository } from '../repositories/userRepository';

export class BookService {
  private bookRepository = new BookRepository();
  private userRepository = new UserRepository();

  async getAllBooks(filters: any) {
    return await this.bookRepository.findAll(filters);
  }

  async getBookById(id: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async createBook(bookData: any, ownerId: string) {
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }

    return await this.bookRepository.create({
      ...bookData,
      currentOwnerId: ownerId
    });
  }

  async updateBook(id: string, bookData: any, userId: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    // Check ownership or admin role
    const user = await this.userRepository.findById(userId);
    if (book.currentOwnerId !== userId && user?.role !== 'admin') {
      throw new Error('Not authorized to update this book');
    }

    return await this.bookRepository.update(id, bookData);
  }

  async deleteBook(id: string, userId: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    const user = await this.userRepository.findById(userId);
    if (book.currentOwnerId !== userId && user?.role !== 'admin') {
      throw new Error('Not authorized to delete this book');
    }

    return await this.bookRepository.delete(id);
  }

  async getUserBooks(userId: string) {
    return await this.bookRepository.findByOwner(userId);
  }
}