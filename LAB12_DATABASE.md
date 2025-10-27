# Лабораторная работа #12 - Подключение к БД и Описание Моделей

## Цель лабораторной работы

1. Установить Sequelize.js и подключить проект к базе данных PostgreSQL
2. Описать модели для предметной области (система обмена и продажи книг)
3. Определить связи между моделями

## Выполненные задачи

### Задание 1: Установка Sequelize.js и подключение к БД

#### Установленные зависимости

```bash
npm install sequelize pg pg-hstore --save
npm install --save-dev @types/sequelize
```

#### Конфигурация подключения

Создан файл `src/config/database.ts`:

```typescript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'bookswap',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

#### Проверка соединения

Функция проверки подключения:

```typescript
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};
```

#### Результат

- ✅ Sequelize.js установлен
- ✅ Подключение к PostgreSQL настроено
- ✅ Проверка соединения реализована
- ✅ База данных синхронизируется при запуске

### Задание 2: Описание моделей

#### Структура моделей

Создано 5 моделей в папке `src/models/`:

1. **User** (`User.ts`) - Пользователи системы
2. **Book** (`Book.ts`) - Книги
3. **BookReview** (`BookReview.ts`) - Отзывы о книгах
4. **BookQuote** (`BookQuote.ts`) - Цитаты из книг
5. **BookTrade** (`BookTrade.ts`) - Обмены книгами

#### Модель User (Пользователь)

```typescript
interface UserAttributes {
  id: string;
  name: string;
  password: string;
  balance: number;
  registrationDate: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Поля:**
- `id` - UUID (первичный ключ)
- `name` - уникальное имя пользователя (3-100 символов)
- `password` - хеш пароля (6-255 символов)
- `balance` - баланс пользователя (по умолчанию 500)
- `registrationDate` - дата регистрации
- `role` - роль пользователя ('user' или 'admin')
- `avatarUrl` - URL аватара
- `bio` - биография пользователя

#### Модель Book (Книга)

```typescript
interface BookAttributes {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  currentOwnerId: string;
  isForSale: boolean;
  isForTrade: boolean;
  priceValue?: number;
  publicationYear: number;
  genre: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Поля:**
- `id` - UUID (первичный ключ)
- `title` - название книги (1-255 символов)
- `author` - автор (1-255 символов)
- `description` - описание
- `coverImageUrl` - обложка книги
- `currentOwnerId` - ID владельца (внешний ключ на User)
- `isForSale` - доступна для продажи
- `isForTrade` - доступна для обмена
- `priceValue` - цена (если на продажу)
- `publicationYear` - год издания (1000 - текущий год+5)
- `genre` - жанр

#### Модель BookReview (Отзыв)

```typescript
interface BookReviewAttributes {
  id: string;
  text: string;
  bookId: string;
  reviewerId: string идентификатор;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Поля:**
- `id` - UUID (первичный ключ)
- `text` - текст отзыва (1-2000 символов)
- `bookId` - ID книги (внешний ключ на Book)
- `reviewerId` - ID автора отзыва (внешний ключ на User)

#### Модель BookQuote (Цитата)

```typescript
interface BookQuoteAttributes {
  id: string;
  text: string;
  bookId: string;
  quoterId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Поля:**
- `id` - UUID (первичный ключ)
- `text` - текст цитаты (1-1000 символов)
- `bookId` - ID книги (внешний ключ на Book)
- `quoterId` - ID пользователя (внешний ключ на User)

#### Модель BookTrade (Обмен)

```typescript
interface BookTradeAttributes {
  id: string;
  initiatorId: string;
  initiatorBookId: string;
  recipientId: string;
  recipientBookId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Поля:**
- `id` - UUID (первичный ключ)
- `initiatorId` - ID инициатора обмена (внешний ключ на User)
- `initiatorBookId` - ID книги инициатора (внешний ключ на Book)
- `recipientId` - ID получателя (внешний ключ на User)
- `recipientBookId` - ID книги получателя (внешний ключ на Book)
- `status` - статус обмена ('pending', 'accepted', 'rejected', 'cancelled')

### Связи между моделями

#### One-to-Many (Один-ко-многим)

**User → Book**
```typescript
User.hasMany(Book, {
  foreignKey: 'currentOwnerId',
  as: 'books'
});

Book.belongsTo(User, {
  foreignKey: 'currentOwnerId',
  as: 'currentOwner'
});
```
Один пользователь может владеть многими книгами.

**Book → BookReview**
```typescript
Book.hasMany(BookReview, {
  foreignKey: 'bookId',
  as: 'reviews'
});

BookReview.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});
```
Одна книга может иметь много отзывов.

**User → BookReview**
```typescript
User.hasMany(BookReview, {
  foreignKey: 'reviewerId',
  as: 'reviews'
});

BookReview.belongsTo(User, {
  foreignKey: 'reviewerId',
  as: 'reviewer'
});
```
Один пользователь может писать много отзывов.

**Book → BookQuote**
```typescript
Book.hasMany(BookQuote, {
  foreignKey: 'bookId',
  as: 'quotes'
});

BookQuote.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});
```
Одна книга может иметь много цитат.

**User → BookQuote**
```typescript
User.hasMany(BookQuote, {
  foreignKey: 'quoterId',
  as: 'quotes'
});

BookQuote.belongsTo(User, {
  foreignKey: 'quoterId',
  as: 'quoter'
});
```
Один пользователь может добавлять много цитат.

**User → BookTrade (две связи)**
```typescript
// Связь с инициатором обмена
User.hasMany(BookTrade, {
  foreignKey: 'initiatorId',
  as: 'initiatedTrades'
});

// Связь с получателем
User.hasMany(BookTrade, {
  foreignKey: 'recipientId',
  as: 'receivedTrades'
});
```

**Book → BookTrade (две связи)**
```typescript
// Книга как инициатор
Book.hasMany(BookTrade, {
  foreignKey: 'initiatorBookId',
  as: 'tradesAsInitiatorBook'
});

// Книга как получатель
Book.hasMany(BookTrade, {
  foreignKey: 'recipientBookId',
  as: 'tradesAsRecipientBook'
});
```

### Диаграмма связей

```
User (1) ──────── (*) Book
  │                    │
  │                    │
  │                    └── (*) BookReview
  │                    │
  │                    └── (*) BookQuote
  │
  ├────── (*) BookTrade (initiator)
  │
  ├────── (*) BookTrade (recipient)
  
BookTrade ────── (*) Book (initiatorBook)
BookTrade ────── (*) Book (recipientBook)
```

### Синхронизация с БД

Автоматическая синхронизация при запуске сервера:

```typescript
await sequelize.sync({ 
  force: false,     // не удалять существующие данные
  alter: true       // обновить структуру таблиц
});
```

### Тестовые данные

При первом запуске автоматически создается тестовый админ:
- Имя: `admin`
- Пароль: `admin123`
- Роль: `admin`
- Баланс: `1000`

## Результат

✅ Sequelize.js установлен и настроен  
✅ Подключение к PostgreSQL работает  
✅ Создано 5 моделей с полной типизацией  
✅ Определены все связи между моделями  
✅ База данных синхронизируется автоматически  
✅ Таблицы создаются при первом запуске  

## Файлы проекта

- `src/config/database.ts` - конфигурация подключения
- `src/models/User.ts` - модель пользователя
- `src/models/Book.ts` - модель книги
- `src/models/BookReview.ts` - модель отзыва
- `src/models/BookQuote.ts` - модель цитаты
- `src/models/BookTrade.ts` - модель обмена
- `src/models/index.ts` - связи между моделями

