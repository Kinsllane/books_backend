# Инструкция по настройке и запуску REST API

## Шаг 1: Установка зависимостей

Если еще не установлены зависимости, выполните:

```bash
npm install
```

## Шаг 2: Создание файла .env

Создайте файл `.env` в корневой папке проекта со следующим содержимым:

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

**Важно:** Измените значения `DB_PASSWORD` и `JWT_SECRET` на свои собственные!

## Шаг 3: Создание базы данных

1. Убедитесь, что PostgreSQL установлен и запущен
2. Создайте базу данных:

```sql
CREATE DATABASE bookswap;
```

Или через командную строку psql:

```bash
psql -U postgres
CREATE DATABASE bookswap;
\q
```

## Шаг 4: Компиляция TypeScript

```bash
npm run api:build
```

## Шаг 5: Запуск API сервера

### Вариант 1: Development режим (с hot reload)
```bash
npm run api:dev
```

### Вариант 2: Production режим
```bash
npm run api:start
```

Сервер запустится на `http://localhost:3001`

## Шаг 6: Проверка работоспособности

Откройте браузер или используйте Postman/curl:

```bash
curl http://localhost:3001/api/health
```

Ожидаемый ответ:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "Connected"
}
```

## Тестирование API в Postman

### 1. Регистрация пользователя

**Запрос:**
- Method: `POST`
- URL: `http://localhost:3001/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

**Ответ (201):**
```json
{
  "user": {
    "id": "...",
    "name": "testuser",
    "balance": 500,
    "registrationDate": "2024-01-01",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Вход в систему

**Запрос:**
- Method: `POST`
- URL: `http://localhost:3001/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

### 3. Получить все книги (публичный эндпоинт)

**Запрос:**
- Method: `GET`
- URL: `http://localhost:3001/api/books`

### 4. Создать книгу (требует авторизации)

**Запрос:**
- Method: `POST`
- URL: `http://localhost:3001/api/books`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <ваш_токен>`
- Body:
```json
{
  "title": "Война и мир",
  "author": "Лев Толстой",
  "description": "Эпический роман",
  "coverImageUrl": "/book-cover.png",
  "isForSale": true,
  "isForTrade": false,
  "priceValue": 500,
  "publicationYear": 1869,
  "genre": "Роман"
}
```

### 5. Получить свой профиль

**Запрос:**
- Method: `GET`
- URL: `http://localhost:3001/api/users/profile`
- Headers: `Authorization: Bearer <ваш_токен>`

## Проблемы и решения

### Ошибка подключения к базе данных

**Ошибка:** `Unable to connect to the database`

**Решение:**
1. Убедитесь, что PostgreSQL запущен
2. Проверьте параметры подключения в `.env`
3. Проверьте, существует ли база данных `bookswap`

### Ошибка компиляции TypeScript

**Ошибка:** `Cannot find module`

**Решение:**
```bash
npm install
npm run api:build
```

### Порт уже занят

**Ошибка:** `Port 3001 is already in use`

**Решение:**
1. Измените PORT в `.env` на другой (например, 3002)
2. Или завершите процесс, использующий порт 3001

### База данных не создается автоматически

База данных не создается автоматически. Вы должны создать её вручную перед запуском.

## Структура эндпоинтов

### Публичные эндпоинты (не требуют авторизации):
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/books` - список книг
- `GET /api/books/:id` - книга по ID
- `GET /api/health` - проверка здоровья API

### Защищенные эндпоинты (требуют Bearer токен):

**Пользователи:**
- `GET /api/users` - все пользователи
- `GET /api/users/profile` - свой профиль
- `GET /api/users/:id` - пользователь по ID
- `PUT /api/users/profile` - обновить профиль
- `POST /api/users/balance/top-up` - пополнить баланс
- `DELETE /api/users/:id` - удалить пользователя (admin)

**Книги:**
- `POST /api/books` - создать книгу
- `PUT /api/books/:id` - обновить книгу
- `DELETE /api/books/:id` - удалить книгу
- `GET /api/books/user/my-books` - мои книги

**Обмены:**
- `GET /api/trades/my-trades` - мои обмены
- `GET /api/trades/incoming` - входящие запросы
- `GET /api/trades/outgoing` - исходящие запросы
- `POST /api/trades/propose` - предложить обмен
- `PUT /api/trades/:id/respond` - ответить на обмен
- `DELETE /api/trades/:id/cancel` - отменить обмен

## Тестовые данные

При первом запуске API автоматически создает тестового пользователя-администратора:
- **Имя:** admin
- **Пароль:** admin123
- **Роль:** admin
- **Баланс:** 1000

Используйте этого пользователя для тестирования админских функций.

## Дополнительная помощь

Для получения полной документации по API смотрите файл `README.md` в корне проекта.

