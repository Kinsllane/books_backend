import { testConnection } from '../config/database';
import { User, Book, BookReview, BookQuote, BookTrade } from '../models';

const testDatabase = async (): Promise<void> => {
  try {
    // Проверка соединения
    await testConnection();
    
    // Синхронизация моделей с БД (в development)
    if (process.env.NODE_ENV === 'development') {
      await User.sync({ force: false });
      await Book.sync({ force: false });
      await BookReview.sync({ force: false });
      await BookQuote.sync({ force: false });
      await BookTrade.sync({ force: false });
      console.log('✅ Database synchronized successfully');
    }
    
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

export default testDatabase;