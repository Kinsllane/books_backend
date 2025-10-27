# BookSwap - Система обмена и продажи книг

Этот проект представляет собой веб-приложение для обмена и продажи книг, разработанное в рамках лабораторной работы #13 по разработке REST API.

## Архитектура проекта

Проект состоит из двух частей:
- **Frontend**: React приложение (порт 3000)
- **Backend**: REST API на Node.js + Express + TypeScript (порт 3001)

## Технологии

### Backend:
- Node.js
- Express
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT для аутентификации
- bcryptjs для хеширования паролей

### Frontend:
- React
- TypeScript
- React Router
- Tailwind CSS

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Database Configuration
DB_NAME=bookswap
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Создание базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE bookswap;
```

### 4. Запуск проекта

#### Frontend (в одном терминале):
```bash
npm start
```

#### Backend API (в другом терминале):
```bash
npm run api:dev
```

Или для production:
```bash
npm run api:build
npm run api:start
```

## REST API Документация

Базовый URL: `http://localhost:3001/api`

### Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке Authorization:
```
Authorization: Bearer <token>
```

### Эндпоинты

#### 1. Аутентификация (`/api/auth`)

##### Регистрация пользователя
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "john_doe",
    "balance": 500,
    "registrationDate": "2024-01-01",
    "role": "user",
    "avatarUrl": "/default-avatar.png",
    "bio": ""
  },
  "token": "jwt_token_here"
}
```

##### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response (200):** Аналогично регистрации

#### 2. Пользователи (`/api/users`)

Все эндпоинты требуют аутентификации.

##### Получить всех пользователей
```http
GET /api/users
Authorization: Bearer <token>
```

##### Получить свой профиль
```http
GET /api/users/profile
Authorization: Bearer <token>
```

##### Получить пользователя по ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

##### Обновить профиль
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "avatarUrl": "/custom-avatar.png"
}
```

##### Пополнить баланс
```http
POST /api/users/balance/top-up
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```

##### Удалить пользователя (только админ)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

#### 3. Книги (`/api/books`)

##### Получить все книги
```http
GET /api/books?search=имя&genre=фантастика&forSale=true&forTrade=false
```

**Query параметры:**
- `search` - поиск по названию и автору
- `genre` - фильтр по жанру
- `forSale` - только на продажу (true/false)
- `forTrade` - только на обмен (true/false)

##### Получить книгу по ID
```http
GET /api/books/:id
```

##### Создать книгу
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Название книги",
  "author": "Автор книги",
  "description": "Описание книги",
  "coverImageUrl": "/book-cover.png",
  "isForSale": true,
  "isForTrade": false,
  "priceValue": 250,
  "publicationYear": 2020,
  "genre": "Фантастика"
}
```

##### Обновить книгу
```http
PUT /api/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Обновленное название",
  "priceValue": 300
}
```

##### Удалить книгу
```http
DELETE /api/books/:id
Authorization: Bearer <token>
```

##### Получить свои книги
```http
GET /api/books/user/my-books
Authorization: Bearer <token>
```

#### 4. Обмены (`/api/trades`)

##### Получить все свои обмены
```http
GET /api/trades/my-trades
Authorization: Bearer <token>
```

##### Получить входящие запросы обмена
```http
GET /api/trades/incoming
Authorization: Bearer <token>
```

##### Получить исходящие запросы обмена
```http
GET /api/trades/outgoing
Authorization: Bearer <token>
```

##### Предложить обмен
```http
POST /api/trades/propose
Authorization: Bearer <token>
Content-Type: application/json

{
  "initiatorBookId": "uuid-book-1",
  "recipientBookId": "uuid-book-2"
}
```

##### Ответить на обмен
```http
PUT /api/trades/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "accepted" // или "rejected"
}
```

##### Отменить обмен
```http
DELETE /api/trades/:id/cancel
Authorization: Bearer <token>
```

#### 5. Health Check

##### Проверить статус API
```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "Connected"
}
```

## Модели данных

### User
- `id` (UUID) - уникальный идентификатор
- `name` (String) - имя пользователя (уникальное)
- `password` (String) - хеш пароля
- `balance` (Decimal) - баланс пользователя
- `registrationDate` (Date) - дата регистрации
- `role` (Enum: 'user', 'admin') - роль пользователя
- `avatarUrl` (String) - URL аватара
- `bio` (Text) - биография

### Book
- `id` (UUID)
- `title` (String) - название книги
- `author` (String) - автор
- `description` (Text) - описание
- `coverImageUrl` (String) - обложка
- `currentOwnerId` (UUID) - текущий владелец
- `isForSale` (Boolean) - доступна для продажи
- `isForTrade` (Boolean) - доступна для обмена
- `priceValue` (Decimal) - цена
- `publicationYear` (Integer) - год издания
- `genre` (String) - жанр

### BookTrade
- `id` (UUID)
- `initiatorId` (UUID) - инициатор обмена
- `initiatorBookId` (UUID) - книга инициатора
- `recipientId` (UUID) - получатель
- `recipientBookId` (UUID) - книга получателя
- `status` (Enum: 'pending', 'accepted', 'rejected', 'cancelled')

### BookReview
- `id` (UUID)
- `text` (Text) - текст отзыва
- `bookId` (UUID)
- `reviewerId` (UUID)

### BookQuote
- `id` (UUID)
- `text` (Text) - цитата
- `bookId` (UUID)
- `quoterId` (UUID)

## Тестирование API

Для тестирования API используйте Postman:

1. Импортируйте коллекцию запросов
2. Начните с регистрации или входа
3. Скопируйте полученный JWT токен
4. Используйте токен для доступа к защищенным эндпоинтам

### Пример тестирования в Postman:

1. **Регистрация:**
   - POST `http://localhost:3001/api/auth/register`
   - Body: `{"username": "testuser", "password": "testpass123"}`
   
2. **Вход:**
   - POST `http://localhost:3001/api/auth/login`
   - Body: `{"username": "testuser", "password": "testpass123"}`
   
3. **Получить все книги:**
   - GET `http://localhost:3001/api/books`
   
4. **Создать книгу:**
   - POST `http://localhost:3001/api/books`
   - Headers: `Authorization: Bearer <your_token>`
   - Body: JSON с данными книги

## Структура проекта

```
src/
├── api/                      # Backend API
│   ├── controllers/          # Контроллеры
│   ├── services/             # Бизнес-логика
│   ├── repositories/         # Работа с БД
│   ├── routes/               # Маршруты
│   ├── middleware/           # Middleware (auth)
│   ├── app.ts                # Настройка Express
│   └── server.ts             # Сервер
├── models/                   # Sequelize модели
├── config/                   # Конфигурация
└── ...
```

## Дополнительная информация

При первом запуске автоматически создается тестовый пользователь:
- **Имя:** admin
- **Пароль:** admin123
- **Роль:** admin

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
