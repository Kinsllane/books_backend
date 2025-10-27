# Лабораторная работа #17 - Документирование API с Swagger

## Цель лабораторной работы

Добавить в приложение описание REST API, используя Swagger для автоматической генерации интерактивной документации.

## Выполненные задачи

### 1. Установка зависимостей

```bash
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

**Установленные пакеты:**
- `swagger-ui-express` - Swagger UI для Express
- `swagger-jsdoc` - Генерация Swagger спецификации из JSDoc комментариев
- `@types/swagger-ui-express` - TypeScript типы
- `@types/swagger-jsdoc` - TypeScript типы

### 2. Создание конфигурации Swagger

#### Swagger Config (`src/api/config/swagger.ts`)

Создан файл конфигурации Swagger с описанием:
- Информации об API
- Серверов (development и production)
- Тегов (Authentication, Users, Books, Trades)
- Схем данных (User, Book, Trade, Error, SuccessResponse)
- Схемы безопасности (Bearer Auth)

```typescript
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BookSwap API Documentation',
    version: '1.0.0',
    description: 'REST API documentation for BookSwap - Book trading platform'
  },
  servers: [
    { url: 'http://localhost:3001', clausescription: 'Development server' },
    { url: 'https://api.bookswap.com', description: 'Production server' }
  ],
  // ... схемы и компоненты
};
```

### 3. Интеграция Swagger UI в Express

#### Обновление `src/api/app.ts`

```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookSwap API Documentation'
}));
```

**Доступ к документации:** http://localhost:3001/api-docs

### 4. Документирование эндпоинтов

#### Authentication Routes (`src/api/routes/authRoutes.ts`)

Документированы:
- **POST /api/auth/register** - Регистрация нового пользователя
- **POST /api/auth/login** - Вход пользователя

Пример документации:
```typescript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 255
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or username already exists
 */
```

#### Books Routes (`src/api/routes/bookRoutes.ts`)

Документированы:
- **GET /api/books** - Получить все книги с фильтрами
- **GET /api/books/{id}** - Получить книгу по ID
- **POST /api/books** - Создать новую книгу
- **PUT /api/books/{id}** - Обновить книгу
- **DELETE /api/books/{id}** - Удалить книгу
- **GET /api/books/user/my-books** - Получить книги текущего пользователя

#### Users Routes

Документированы:
- **GET /api/users** - Получить всех пользователей
- **GET /api/users/profile** - Получить профиль текущего пользователя
- **GET /api/users/{id}** - Получить пользователя по ID
- **PUT /api/users/profile** - Обновить профиль
- **POST /api/users/balance/top-up** - Пополнить баланс
- **DELETE /api/users/{id} registration** - Удалить пользователя

#### Trades Routes

Документированы:
- **GET /api/trades/my-trades** - Мои обмены
- **GET /api/trades/incoming** - Входящие обмены
- **GET /api/trades/outgoing** - Исходящие обмены
- **POST /api/trades/propose** - Предложить обмен
- **PUT /api/trades/{id}/respond** - Ответить на обмен
- **DELETE /api/trades/{id}/cancel** - Отменить обмен

## Схемы данных

### User Schema

```yaml
User:
  type: object
  properties:
    id:
      type: string
      format: uuid
      description: User unique identifier
    name:
      type: string
      description: Username
    balance:
      type: number
      format: decimal
      description: User balance in credits
    role:
      type: string
      enum: [user, admin]
      description: User role
```

### Book Schema

```yaml
Book:
  type: object
  properties:
    id:
      type: string
      format: uuid
      description: Book unique identifier
    title:
      type: string
      description: Book title
    author:
      type: string
      description: Book author
    price:
      type: number
      format: decimal
      description: Book price in credits
    forSale:
      type: boolean
      description: Is book for sale?
    forTrade:
      type: boolean
      description: Is book for trade?
```

### Trade Schema

```yaml
Trade:
  type: object
  properties:
    id:
      type: string
      format: uuid
    status:
      type: string
      enum: [pending, accepted, rejected, cancelled]
    initiatorId:
      type: string
      format: uuid
    recipientId:
      type: string
      format: uuid
```

## Безопасность

### Bearer Authentication

Все защищенные эндпоинты используют JWT аутентификацию:

```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: JWT token obtained from login endpoint
```

**Использование в эндпоинте:**
```yaml
security:
  - bearerAuth: []
```

## Теги API

Документация организована по тегам:
- **Authentication** - Аутентификация и авторизация
- **Users** - Управление пользователями
- **Books** - Управление книгами
- **Trades** - Обмены книгами

## Доступ к документации

### Локальный доступ

После запуска сервера:
```bash
npm run api:dev
```

Документация доступна по адресу: **http://localhost:3001/api-docs**

### Возможности Swagger UI

✅ **Интерактивная документация** - можно тестировать API прямо из браузера
✅ **Автоматическая валидация** - проверка запросов и ответов
✅ **Авторизация** - удобная авторизация для защищенных эндпоинтов
✅ **Примеры запросов** - готовые примеры для каждого эндпоинта
✅ **Схемы данных** - подробное описание моделей данных

## Использование Swagger UI

### 1. Авторизация

1. Откройте http://localhost:3001/api-docs
2. Найдите эндпоинт **POST /api/auth/login**
3. Нажмите "Try it out"
4. Введите данные пользователя
5. Выполните запрос
6. Скопируйте токен из ответа
7. Нажмите кнопку "Authorize" в правом верхнем углу
8. Вставьте токен в формате: `Bearer YOUR_TOKEN_HERE`
9. Нажмите "Authorize"

Теперь все защищенные эндпоинты будут использовать этот токен.

### 2. Тестирование эндпоинтов

1. Выберите интересующий эндпоинт
2. Нажмите "Try it out"
3. Заполните параметры запроса (если есть)
4. Нажмите "Execute"
5. Просмотрите ответ сервера

### 3. Просмотр схем данных

Схемы доступны в разделе **Schemas** внизу страницы.

## Структура файлов

```
src/
├── api/
│   ├── config/
│   │   └── swagger.ts          # Конфигурация Swagger
│   ├── routes/
│   │   ├── authRoutes.ts       # Эндпоинты авторизации
│   │   ├── bookRoutes.ts       # Эндпоинты книг
│   │   ├── userRoutes.ts       # Эндпоинты пользователей
│   │   └── tradeRoutes.ts      # Эндпоинты обменов
│   └── app.ts                  # Интеграция Swagger UI
```

## JSDoc аннотации

Все эндпоинты документируются с помощью JSDoc комментариев перед определением роута:

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   method:
 *     summary: Description
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters: [...]
 *     requestBody: {...}
 *     responses:
 *       200:
 *         description: Success
 */
```

## Преимущества Swagger

### Для разработчиков:
✅ Единое место для всей документации API
✅ Автоматическая валидация запросов
✅ Интерактивное тестирование
✅ Примеры использования

### Для клиентов API:
✅ Наглядная документация
✅ Возможность протестировать API
✅ Понимание структуры данных
✅ Информация об ошибках

## Конфигурация Swagger

### Описание API

```typescript
info: {
  title: 'BookSwap API Documentation',
  version: '1.0.0',
  description: 'REST API documentation for BookSwap',
  contact: {
    name: 'API Support',
    email: 'support@bookswap.com'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  }
}
```

### Серверы

```typescript
servers: [
  { url: 'http://localhost:3001', description: 'Development' },
  { url: 'https://api.bookswap.com', description: 'Production' }
]
```

## Примеры документации эндпоинтов

### Регистрация пользователя

**Эндпоинт:** POST /api/auth/register

**Описание:** Регистрация нового пользователя в системе

**Тело запроса:**
```json
{
  "username": "john_doe",
  "password": " extremelySecure123"
}
```

**Ответ (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "john_doe",
    "balance": 500,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Создание книги

**Эндпоинт:** POST /api/books

**Описание:** Создание новой книги (требует авторизации)

**Заголовки:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Тело запроса:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "1234567890",
  "genre": "Fiction",
  "description": "Classic American novel",
  "price": 100,
  "forSale": true,
  "forTrade": false
}
```

**Ответ (201):**
```json
{
  "id": "uuid",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  ...
}
```

## Расширение документации

### Добавление нового эндпоинта

1. Создайте роут в соответствующем файле
2. Добавьте JSDoc комментарии перед определением роута
3. Укажите:
   - Метод HTTP
   - Путь
   - Краткое описание
   - Тег
   - Параметры
   - Тело запроса
   - Ответы

### Пример:

```typescript
/**
 * @swagger
 * /api/example/{id}:
 *   get:
 *     summary: Get example by ID
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', controller.method);
```

## Проблемы и решения

### Проблема 1: Отсутствие типов TypeScript

**Ошибка:** `Could not find a declaration file for module 'swagger-ui-express'`

**Решение:**
```bash
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

### Проблема 2: Не отображается документация

**Решение:** Проверьте, что Swagger UI подключен до определения роутов:
```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### Проблема 3: Комментарии не парсятся

**Решение:** Убедитесь, что файлы указаны в `apis` конфигурации:
```typescript
apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts']
```

## Best Practices

### 1. Описательные summary

Используйте краткие и понятные описания:
```typescript
summary: Register a new user
// ✅ Хорошо

summary: Register
// ❌ Плохо
```

### 2. Детальные examples

Добавляйте примеры для всех полей:
```typescript
username:
  type: string
  example: john_doe
```

### 3. Все коды ответов

Документируйте все возможные коды ответов:
```typescript
responses:
  200: {...}
  400: {...}
  401: {...}
  404: {...}
  500: {...}
```

### 4. Обязательные поля

Указывайте обязательные поля:
```typescript
requestBody:
  required: true
  content:
    application/json:
      schema:
        required:
          - username
          - password
```

## Выводы

✅ Установлен и настроен Swagger
- swagger-ui-express и swagger-jsdoc
- Конфигурация в `src/api/config/swagger.ts`

✅ Интегрирован в Express
- Доступен по адресу `/api-docs`
- Подключен в `src/api/app.ts`

✅ Документированы все эндпоинты
- Authentication (2 endpoints)
- Books (6 endpoints)
- Users (6 endpoints)
- Trades (6 endpoints)

✅ Созданы схемы данных
- User, Book, Trade, Error, SuccessResponse

✅ Настроена безопасность
- Bearer Authentication
- JWT токены

## Файлы проекта

- `src/api/config/swagger.ts` - конфигурация Swagger
- `src/api/app.ts` - интеграция Swagger UI
- `src/api/routes/authRoutes.ts` - документация auth
- `src/api/routes/bookRoutes.ts` - документация books
- `src/api/routes/userRoutes.ts` - документация users
- `src/api/routes/tradeRoutes.ts` - документация trades

## Документация

См. также:
- `LAB12_DATABASE.md` - Работа с базой данных
- `LAB13_REST_API.md` - REST API архитектура
- `VALIDATION.md` - Валидация данных
- `LAB15_AUTHENTICATION.md` - Аутентификация
- `LAB16_TESTING.md` - Тестирование
- `API_SETUP.md` - Настройка и запуск

## Результат лабораторной работы

✅ Успешно добавлена документация с Swagger  
✅ Создана интерактивная документация API  
✅ Документированы все эндпоинты  
✅ Настроена авторизация в документации  
✅ Добавлены примеры запросов и ответов  

## Доступ к документации

После запуска сервера:
```
http://localhost:3001/api-docs
```

## Команды

```bash
# Запустить API сервер
npm run api:dev

# Открыть документацию в браузере
# http://localhost:3001/api-docs
```

