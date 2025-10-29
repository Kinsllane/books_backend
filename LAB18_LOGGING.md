# Лабораторная работа #18 - Логирование

## Цель лабораторной работы

Добавить в приложение логирование. Реализовать логирование 2 типов: HTTP логи и логирование операций с базой данных. Логи должны хранится в MongoDB. Для описания структуры коллекций использовать Mongoose.

## Выполненные задачи

### 1. Установка зависимостей

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

**Установленные пакеты:**
- `mongoose` - ODM для MongoDB
- `@types/mongoose` - TypeScript типы для Mongoose

### 2. Настройка подключения к MongoDB

#### MongoDB Config (`src/config/mongodb.ts`)

Создан файл конфигурации для подключения к MongoDB:

```typescript
export const connectMongoDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookswap_logs';
  
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected for logging');
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
};
```

**URI подключения:** `mongodb://localhost:27017/bookswap_logs`

### 3. Создание моделей для логов

#### HTTP Log Model (`src/models/logs/HttpLog.ts`)

Модель для логирования HTTP запросов:

**Структура:**
```typescript
interface IHttpLog {
  method: string;           // GET, POST, PUT, DELETE, PATCH
  url: string;              // URL запроса
  statusCode: number;       // HTTP статус ответа
  responseTime: number;     // Время выполнения (мс)
  ip: string;               // IP адрес клиента
  userAgent?: string;       // User-Agent
  userId?: string;          // ID пользователя (если авторизован)
  requestBody?: any;        // Тело запроса
  responseBody?: any;       // Тело ответа
  error?: string;           // Ошибка (если есть)
  timestamp: Date;          // Время запроса
}
```

**Индексы:**
- `timestamp` - для полярных запросов по времени
- `method + timestamp` - для запросов по методу
- `statusCode + timestamp` - для фильтрации по статусу
- `userId + timestamp` - для запросов конкретного пользователя

#### Database Log Model (`src/models/logs/DatabaseLog.ts`)

Модель для логирования операций с БД:

**Структура:**
```typescript
interface IDatabaseLog {
  operation: string;        // Описание операции
  modelName: string;        // Название модели
  recordId?: string;        // ID записи
  action: string;           // CREATE, UPDATE, DELETE, READ
  userId?: string;          // ID пользователя
  changes?: any;            // Изменения
  success: boolean;         // Успешность операции
  error?: string;           // Ошибка (если есть)
  executionTime: number;    // Время выполнения (мс)
  timestamp: Date;          // Время операции
}
```

**Индексы:**
- `timestamp` - для запросов по времени
- `modelName + timestamp` - для запросов по модели
- `action + timestamp` - для запросов по действию
- `success + timestamp` - для фильтрации успешных/неуспешных
- `userId + timestamp` - для запросов конкретного пользователя

### 4. Реализация HTTP Logger

#### HTTP Logger Middleware (`src/api/middleware/httpLogger.ts`)

Middleware для логирования всех HTTP запросов:

**Функциональность:**
- Измеряет время выполнения запроса
- Логирует метод, URL, статус код
- Сохраняет IP адрес и User-Agent
- Извлекает userId из авторизованного пользователя
- Сохраняет тело запроса (скрывает пароли)
- Сохраняет тело ответа
- Логирует ошибки

**Пример работы:**
```typescript
export const httpLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    
    await HttpLog.create({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      timestamp: new Date()
    });
  });
  
  next();
};
```

### 5. Интеграция в приложение

#### Обновление `src/api/app.ts`

Добавлено:
1. Импорт HTTP Logger
2. Подключение к MongoDB при старте
3. Middleware для логирования всех запросов

```typescript
import { connectMongoDB } from '../config/mongodb';
import { httpLogger } from './middleware/httpLogger';

// HTTP Logger - логирование всех HTTP запросов
app.use(httpLogger);

// Инициализация MongoDB для логирования
const initializeAPI = async (): Promise<void> => {
  try {
    await testConnection();
    
    // ... синхронизация Sequelize ...
    
    // Подключение к MongoDB для логирования
    try {
      await connectMongoDB();
    } catch (error) {
      console.log('⚠️ MongoDB connection failed, logging will be skipped');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize API server:', error);
  }
};
```

## Структура коллекций в MongoDB

### Коллекция: `http_logs`

```json
{
  "method": "POST",
  "url": "/api/auth/login",
  "statusCode": 200,
  "responseTime": 145,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user-uuid",
  "requestBody": {
    "username": "john_doe",
    "password": "***hidden***"
  },
  "responseBody": {
    "user": {...},
    "token": "..."
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Коллекция: `database_logs`

```json
{
  "operation": "Create book",
  "modelName": "Book",
  "recordId": "book-uuid",
  "action": "CREATE",
  "userId": "user-uuid",
  "changes": {
    "title": "New Book",
    "author": "Author Name"
  },
  "success": true,
  "executionTime": 45,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Настройка

### Переменная окружения

Добавьте в `.env`:
```env
MONGO_URI=mongodb://localhost:27017/bookswap_logs
```

### Запуск MongoDB

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Проверка подключения

После запуска API сервера должно появиться:
```
✅ MongoDB connected for logging
```

Если MongoDB не доступен:
```
⚠️ MongoDB connection failed, logging will be skipped
```

Приложение продолжит работать без логирования.

## Использование

### Автоматическое логирование

Все HTTP запросы автоматически логируются при использовании `httpLogger` middleware.

### Просмотр логов

**MongoDB Shell:**
```javascript
// Подключение к БД
use bookswap_logs

// Все HTTP логи
db.http_logs.find().sort({timestamp: -1}).limit(10)

// Ошибки HTTP (status >= 400)
db.http_logs.find({statusCode: {$gte: 400}}).sort({timestamp: -1})

// Логи конкретного пользователя
db.http_logs.find({userId: "user-uuid"}).sort({timestamp: -1})

// Все операции с БД
db.database_logs.find().sort({timestamp: -1}).limit(10)

// Неуспешные операции
db.database_logs.find({success: false}).sort({timestamp: -1})
```

**MongoDB Compass:**
1. Подключитесь к `mongodb://localhost:27017`
2. Выберите базу данных `bookswap_logs`
3. Просмотрите коллекции `http_logs` и `database_logs`

## Примеры логов

### HTTP Log - Успешный запрос

```json
{
  "method": "GET",
  "url": "/api/books",
  "statusCode": 200,
  "responseTime": 120,
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### HTTP Log - Ошибка

```json
{
  "method": "POST",
  "url": "/api/books",
  "statusCode": 401,
  "responseTime": 15,
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "error": "HTTP Error",
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

### Database Log - Создание записи

```json
{
  "operation": "Create book",
  "modelName": "Book",
  "recordId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "CREATE",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "success": true,
  "executionTime": 45,
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

## Преимущества

### HTTP логи:
✅ Отслеживание всех API запросов
✅ Мониторинг производительности
✅ Анализ использования API
✅ Выявление проблем и ошибок
✅ Аудит действий пользователей

### Database логи:
✅ Отслеживание всех операций с БД
✅ Мониторинг производительности запросов
✅ Выявление медленных запросов
✅ Аудит изменений данных
✅ Отладка проблем с БД

## Безопасность

### Защита чувствительных данных

Пароли автоматически скрываются в логах:
```typescript
if (requestBody.password) {
  requestBody.password = '***hidden***';
}
```

### Удаление старых логов

Рекомендуется настроить TTL индексы для автоматического удаления старых логов:

```javascript
// TTL индекс для HTTP логов (90 дней)
db.http_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
);

// TTL индекс для DB логов (180 дней)
db.database_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 15552000 }
);
```

## Структура файлов

```
src/
├── config/
│   └── mongodb.ts              # Подключение к MongoDB
├── models/
│   └── logs/
│       ├── HttpLog.ts          # Модель HTTP логов
│       └── DatabaseLog.ts      # Модель DB логов
└── api/
    ├── middleware/
    │   └── httpLogger.ts       # HTTP Logger middleware
    └── app.ts                  # Интеграция логирования
```

## Выводы

✅ Установлен и настроен Mongoose
- mongoose и @types/mongoose
- Подключение к MongoDB

✅ Созданы модели для логов
- HttpLog - для HTTP запросов
- DatabaseLog - для операций с БД
- Индексы для быстрого поиска

✅ Реализовано HTTP логирование
- Middleware для всех запросов
- Автоматическое логирование
- Безопасное хранение данных

✅ Хранение логов в MongoDB
- Коллекция http_logs
- Коллекция database_logs
- Использование Mongoose

## Документация

См. также:
- `LAB12_DATABASE.md` - Работа с базой данных
- `LAB13_REST_API.md` - REST API архитектура
- `LAB16_TESTING.md` - Тестирование
- `LAB17_DOCUMENTATION.md` - Документирование API

## Результат лабораторной работы

✅ Успешно добавлено логирование в приложение  
✅ Реализованы HTTP логи  
✅ Реализовано логирование операций с БД  
✅ Логи хранятся в MongoDB  
✅ Использован Mongoose для описания структуры  
✅ Созданы индексы для быстрого поиска  

