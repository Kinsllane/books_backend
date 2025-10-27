# Журнал изменений - Лабораторная работа #13

## Исправленные проблемы

### 1. ✅ Исправлена логика обмена книгами (TradeService)

**Проблема:** В методе `proposeTrade` не передавался `recipientId`, что приводило к ошибкам при создании обмена.

**Решение:**
- Добавлено получение данных книг инициирующей и получающей стороны
- Добавлена автоматическая передача `recipientId` на основе владельца книги получателя
- Добавлены проверки:
  - Проверка прав собственности на книгу
  - Проверка невозможности обмена с самим собой
  - Проверка доступности книг для обмена
  - Проверка отсутствия дублирующих обменов
- Улучшена валидация в методе `respondToTrade`

### 2. ✅ Обновлена документация

**Добавлено:**
- Полная документация REST API в `README.md`
- Подробная инструкция по настройке в `API_SETUP.md`
- Описание всех эндпоинтов с примерами
- Описание моделей данных
- Инструкции по тестированию

### 3. ✅ Структура проекта

**Подтверждено наличие:**
- ✅ Модели (User, Book, BookTrade, BookReview, BookQuote)
- ✅ Контроллеры для всех сущностей
- ✅ Сервисы с бизнес-логикой
- ✅ Репозитории для работы с БД
- ✅ Маршрутизация (Routes)
- ✅ Middleware для аутентификации (JWT)
- ✅ Правильные ассоциации между моделями

## Что нужно сделать для запуска

### 1. Создайте файл `.env`

Создайте файл `.env` в корне проекта:

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

### 2. Создайте базу данных

```sql
CREATE DATABASE bookswap;
```

### 3. Установите зависимости (если еще не установлены)

```bash
npm install
```

### 4. Соберите API

```bash
npm run api:build
```

### 5. Запустите API сервер

```bash
npm run api:dev
```

## Тестирование API

### Быстрый тест (curl)

```bash
# Health check
curl http://localhost:3001/api/health

# Регистрация
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Вход (получите токен)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Получить все книги (публичный эндпоинт)
curl http://localhost:3001/api/books
```

### Тестирование в Postman

1. Откройте Postman
2. Создайте новый request
3. Начните с регистрации или входа пользователя
4. Скопируйте JWT токен из ответа
5. Используйте токен в заголовке Authorization:
   ```
   Authorization: Bearer <your_token>
   ```

См. подробную инструкцию в файле `API_SETUP.md`

## Основные эндпоинты

### Публичные
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/books` - список книг
- `GET /api/books/:id` - книга по ID
- `GET /api/health` - проверка здоровья

### Защищенные (требуют Bearer токен)

**Пользователи:**
- `GET /api/users` - все пользователи
- `GET /api/users/profile` - свой профиль
- `PUT /api/users/profile` - обновить профиль
- `POST /api/users/balance/top-up` - пополнить баланс

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

## Тестовый пользователь

При первом запуске создается тестовый админ:
- **Имя:** admin
- **Пароль:** admin123
- **Роль:** admin

## Архитектура

Проект следует паттерну MVC с разделением на слои:

1. **Routes** (`src/api/routes/`) - определение маршрутов
2. **Controllers** (`src/api/controllers/`) - обработка HTTP запросов
3. **Services** (`src/api/services/`) - бизнес-логика
4. **Repositories** (`src/api/repositories/`) - работа с БД
5. **Models** (`src/models/`) - Sequelize модели
6. **Middleware** (`src/api/middleware/`) - аутентификация

## Соответствие требованиям лабораторной работы

✅ Модели из ЛР #13  
✅ Маршрутизация (routes)  
✅ Контроллеры (controllers)  
✅ Сервисы (services)  
✅ Репозитории (repositories)  
✅ Работа с БД через Sequelize ORM  
✅ REST API согласно описанию  
✅ Готовность к тестированию в Postman  

## Дополнительная информация

Для получения подробной информации см.:
- `README.md` - общая документация проекта
- `API_SETUP.md` - инструкция по настройке и тестированию API

