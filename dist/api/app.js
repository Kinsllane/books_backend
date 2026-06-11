"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAPI = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_1 = require("../config/database");
const database_2 = __importDefault(require("../config/database"));
const databaseMigrations_1 = require("../config/databaseMigrations");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tradeRoutes_1 = __importDefault(require("./routes/tradeRoutes"));
const swagger_1 = __importDefault(require("./config/swagger"));
const httpLogger_1 = require("./middleware/httpLogger");
// Импорт моделей для синхронизации
require("../models");
// Импорт Passport
const passport_1 = __importDefault(require("./config/passport"));
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP Logger - логирование всех HTTP запросов
app.use(httpLogger_1.httpLogger);
// Инициализация Passport
app.use(passport_1.default.initialize());
// Swagger documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BookSwap API Documentation'
}));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/books', bookRoutes_1.default);
app.use('/api/trades', tradeRoutes_1.default);
// Health check
app.get('/api/health', async (req, res) => {
    try {
        await (0, database_1.testConnection)();
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected'
        });
    }
    catch (error) {
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? errorMessage : 'Something went wrong'
    });
});
// Initialize database connection
const initializeAPI = async () => {
    try {
        await (0, database_1.testConnection)();
        await database_2.default.sync({
            force: false,
            alter: true
        });
        console.log('✅ Database synced successfully');
        // Запускаем миграции после sync (Views должны создаваться после создания таблиц)
        try {
            await (0, databaseMigrations_1.runMigrations)();
        }
        catch (error) {
            console.log('⚠️ Миграции пропущены (возможно Views уже существуют)');
        }
        console.log('✅ API server initialized successfully');
        await createTestData();
    }
    catch (error) {
        console.error('❌ Failed to initialize API server:', error);
        process.exit(1);
    }
};
exports.initializeAPI = initializeAPI;
// Функция для создания тестовых данных
const createTestData = async () => {
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
    }
    catch (error) {
        // Правильная обработка ошибки
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('⚠️ Test data creation skipped or failed:', errorMessage);
    }
};
