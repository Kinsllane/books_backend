import { Op } from 'sequelize';
import Book from '../../models/Book';
import User from '../../models/User';

export class BookRepository {
  async findAll(filters: {
    search?: string;
    genre?: string;
    forSale?: boolean;
    forTrade?: boolean;
    ownerId?: string;
  } = {}): Promise<Book[]> {
    const where: any = {};

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { author: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    if (filters.genre) where.genre = filters.genre;
    if (filters.forSale !== undefined) where.isForSale = filters.forSale;
    if (filters.forTrade !== undefined) where.isForTrade = filters.forTrade;
    if (filters.ownerId) where.currentOwnerId = filters.ownerId;

    return await Book.findAll({
      where,
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id: string): Promise<Book | null> {
    return await Book.findByPk(id, {
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }]
    });
  }

  async create(bookData: Omit<Partial<Book>, 'id'>): Promise<Book> {
    return await Book.create(bookData as any);
  }
  
  async update(id: string, bookData: Partial<Book>): Promise<Book | null> {
    const book = await Book.findByPk(id);
    if (!book) return null;
  
    return await book.update(bookData as any);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Book.destroy({ where: { id } });
    return deleted > 0;
  }

  async findByOwner(ownerId: string): Promise<Book[]> {
    return await Book.findAll({
      where: { currentOwnerId: ownerId },
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }]
    });
  }
}