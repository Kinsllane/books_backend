import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'bookswap',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

/**
 * Безопасное выполнение миграций - сервер запустится даже если миграции не выполнятся
 */
export const runMigrationsSafe = async (): Promise<void> => {
  const queryInterface = sequelize.getQueryInterface();
  console.log('🔄 Запуск миграций PostgreSQL...');

  const safeRun = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✅ ${name}`);
    } catch (err: any) {
      console.log(`⚠️ ${name}: ${err.message?.substring(0, 60) || 'пропущено'}`);
    }
  };

  // 1. ENUM типы (безопасно - если есть, пропускаем)
  await safeRun('ENUM типы', async () => {
    await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryInterface.sequelize.query(`DO $$ BEGIN CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
  });

  // 2. Добавляем колонку rating если её нет
  await safeRun('Add rating column', async () => {
    await queryInterface.sequelize.query(`
      ALTER TABLE book_reviews 
      ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 
      CHECK (rating >= 1 AND rating <= 5);
    `);
  });

  // 3. Views - создаём после sync (удаление уже сделано в initializeAPI)
  await safeRun('Views', async () => {
    // Создаём новые Views
    await queryInterface.sequelize.query(`
      CREATE VIEW user_activity_summary AS
      SELECT u.id, u."role",
        COUNT(DISTINCT b.id) as books_owned,
        COUNT(DISTINCT br.id) as reviews_written,
        u.balance
      FROM users u
      LEFT JOIN books b ON u.id = b."currentOwnerId"
      LEFT JOIN book_reviews br ON u.id = br."reviewerId"
      GROUP BY u.id, u.role, u.balance;
    `);
    
    await queryInterface.sequelize.query(`
      CREATE VIEW book_engagement_analytics AS
      SELECT b.id, b.title, b.genre,
        COUNT(br.id) as review_count,
        COALESCE(AVG(br.rating), 0) as average_rating
      FROM books b
      LEFT JOIN book_reviews br ON b.id = br."bookId"
      GROUP BY b.id, b.title, b.genre;
    `);
  });

  // 3. Partial Indexes - безопасно
  await safeRun('Partial Indexes', async () => {
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_books_genre_for_sale ON books(genre) WHERE "isForSale" = true;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_books_genre_for_trade ON books(genre) WHERE "isForTrade" = true;
    `);
  });

  // 4. Триггеры - безопасно
  await safeRun('Триггеры', async () => {
    // Добавляем колонку deletedAt
    await queryInterface.sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;`);
    
    // Функция для обновления баланса
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_user_balance()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          UPDATE users SET balance = balance - NEW.amount WHERE id = NEW."fromUserId";
          UPDATE users SET balance = balance + NEW.amount WHERE id = NEW."toUserId";
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Триггер
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS tr_transaction_complete ON transactions;
      CREATE TRIGGER tr_transaction_complete
      AFTER UPDATE OF status ON transactions
      FOR EACH ROW WHEN (NEW.status = 'completed')
      EXECUTE FUNCTION update_user_balance();
    `);
  });

  // 5. Materialized View - безопасно
  await safeRun('Materialized View', async () => {
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS mv_genre_statistics;
      CREATE MATERIALIZED VIEW mv_genre_statistics AS
      SELECT genre, COUNT(*) as total_books,
        ROUND(AVG("priceValue")::numeric, 2) as avg_price
      FROM books GROUP BY genre ORDER BY total_books DESC;
    `);
  });

  console.log('🎉 Миграции завершены (или пропущены)');
};

export default sequelize;
export { runMigrationsSafe as runMigrations };