import { Request, Response } from 'express';
import { BookService } from '../services/bookService';

export class BookController {
  private bookService = new BookService();

  getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, genre, forSale, forTrade } = req.query;
      
      const filters = {
        search: search as string,
        genre: genre as string,
        forSale: forSale ? forSale === 'true' : undefined,
        forTrade: forTrade ? forTrade === 'true' : undefined,
      };

      const books = await this.bookService.getAllBooks(filters);
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const book = await this.bookService.getBookById(id);
      res.status(200).json(book);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  createBook = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = req.user as any;
      const book = await this.bookService.createBook(req.body, user.id);
      res.status(201).json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = req.user as any;
      const { id } = req.params;
      const book = await this.bookService.updateBook(id, req.body, user.id);
      res.status(200).json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = req.user as any;
      const { id } = req.params;
      await this.bookService.deleteBook(id, user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getUserBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = req.user as any;
      const books = await this.bookService.getUserBooks(user.id);
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}