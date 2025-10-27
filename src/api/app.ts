import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { testConnection } from '../config/database';
import sequelize from '../config/database';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import authRoutes from './routes/authRoutes';
import tradeRoutes from './routes/tradeRoutes';
import swaggerSpec from './config/swagger';

// Импорт моделей для синхронизации
import '../models';

// Импорт Passport
import passport from './config/passport';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Инициализация Passport
app.use(passport.initialize());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookSwap API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/trades', tradeRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected' 
    });
  } catch (error) {
    // Правильная обработка unknown типа
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: errorMessage 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware - должен быть последним
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: isDevelopment ? errorMessage : 'Something went wrong'
  });
});

// Initialize database connection
const initializeAPI = async (): Promise<void> => {
  try {
    await testConnection();
    
    await sequelize.sync({ 
      force: false,
      alter: true
    });
    
    console.log('✅ Database synced successfully');
    console.log('✅ API server initialized successfully');
    
    await createTestData();
    
  } catch (error) {
    console.error('❌ Failed to initialize API server:', error);
    process.exit(1);
  }
};

// Функция для создания тестовых данных
const createTestData = async (): Promise<void> => {
  try {
    const User = require('../models/User').default;
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('📝 Creating test data...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        name: 'admin',
        password: hashedPassword,
        balance: 1000,
        registrationDate: new Date().toISOString().split('T')[0],
        role: 'admin',
        avatarUrl: '/default-avatar.png',
        bio: 'Системный администратор'
      });
      
      console.log('✅ Test admin user created');
    }
  } catch (error) {
    // Правильная обработка ошибки
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('⚠️ Test data creation skipped or failed:', errorMessage);
  }
};

export { app, initializeAPI };