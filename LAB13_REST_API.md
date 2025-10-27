# Лабораторная работа #13 - Разработка REST API

## Цель лабораторной работы

Создать полный REST API для системы обмена и продажи книг с использованием архитектуры на основе:
- Маршрутизация (Routes)
- Контроллеры (Controllers)
- Сервисы (Services)
- Репозитории (Repositories)

## Архитектура API

Применен паттерн **MVC (Model-View-Controller)** с дополнительным слоем сервисов и репозиториев:

```
Routes → Controllers → Services → Repositories → Models → Database
```

### Слои архитектуры

1. **Routes** - определение эндпоинтов и middleware
2. **Controllers** - обработка HTTP запросов/ответов
3. **Services** - бизнес-логика
4. **Repositories** - работа с БД через Sequelize
5. **Models** - описание структуры данных

## Структура проекта

```
src/api/
├── routes/           # Маршрутизация
├── controllers/      # HTTP обработчики
├── services/         # Бизнес-логика
├── repositories/     # Работа с БД
├── middleware/       # Middleware (auth, validation)
└── validators/       # Схемы валидации
```

## Маршрутизация (Routes)

### Auth Routes (`authRoutes.ts`)

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validators.impl/authValidator';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
```

### Book Routes (`bookRoutes.ts`)

```typescript
router.get('/', validate(getBooksQuerySchema), optionalAuth, bookController.getAllBooks);
router.get('/:id', validate(getBookSchema), optionalAuth, bookController.getBookById);
router.post('/', authenticateToken, validate(createBookSchema), bookController.createBook);
router.put('/:id', authenticateToken, validate(updateBookSchema), bookController.updateBook);
router.delete('/:id', authenticateToken, validate(deleteBookSchema), bookController.deleteBook);
router.get('/user/my-books', authenticateToken, bookController.getUserBooks);
```

### User Routes (`userRoutes.ts`)

```typescript
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/profile', authenticateToken, userController.getMyProfile);
router.get('/:id', authenticateToken, validate(getUserSchema), userController.getUserById);
router.put('/profile', authenticateToken, validate(updateProfileSchema), userController.updateProfile);
router.post('/balance/top-up', authenticateToken, validate(topUpBalanceSchema), userController.topUpBalance);
router.delete('/:id', authenticateToken, validate(deleteUserSchema), userController.deleteUser);
```

### Trade Routes (`tradeRoutes.ts`)

```typescript
router.get('/my-trades', authenticateToken, tradeController.getMyTrades);
router.get('/incoming', authenticateToken, tradeController.getIncomingTrades);
router.get('/outgoing', authenticateToken, tradeController.getOutgoingTrades);
router.post('/propose', authenticateToken, validate(proposeTradeSchema), tradeController.proposeTrade);
router.put('/:id/respond', authenticateToken, validate(respondToTradeSchema), tradeController.respondToTrade);
router.delete('/:id/cancel', authenticateToken, validate(cancelTradeSchema), tradeController.cancelTrade);
```

## Контроллеры (Controllers)

### Auth Controller (`authController.ts`)

```typescript
export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await this.authService.register(username, password);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    // Аналогично
  };
}
```

**Ответственность:**
- Обработка HTTP запросов
- Проверка наличия обязательных полей
- Вызов соответствующих сервисов
- Формирование HTTP ответов

### Book Controller (`bookController.ts`)

```typescript
export class BookController {
  private bookService = new BookServiceComparing approach);

  getAllBooks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, genre, forSale, forTrade } = req.query;
      
      const filters = {
        search: search as string,
        genre: genre as string,
        forSale: forSale ? forSale === 'true' : undefined,
        forTrade: forTrade ? forTrade === 'true' : undefined,
      };

      const books = await this.bookService.getAllBooks(filters);
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Другие методы: getBookById, createBook, updateBook, deleteBook, getUserBooks
}
```

## Сервисы (Services)

### Book Service (`bookService.ts`)

```typescript
export class BookService {
  private bookRepository = new BookRepository();
  private userRepository = new UserRepository();

  async getAllBooks(filters: any) {
    return await this.bookRepository.findAll(filters);
  }

  async createBook(bookData: any, ownerId: string) {
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }

    return await this.bookRepository.create({
      ...bookData,
      currentOwnerId: ownerId
    });
  }

  async updateBook(id: string, bookData: any, userId: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    // Проверка прав доступа
    const user = await this.userRepository.findById(userId);
    if (book.currentOwnerId !== userId && user?.role !== 'admin') {
      throw new Error('Not authorized to update this book');
    }

    return await this.bookRepository.update(id, bookData);
  }

  // Остальные методы...
}
```

**Ответственность:**
- Реализация бизнес-логики
- Проверка прав доступа
- Валидация условий
- Координация работы репозиториев

### Trade Service (`tradeService.ts`)

```typescript
export class TradeService {
  private tradeRepository = new TradeRepository();
  private bookRepository = new BookRepository();

  async proposeTrade(initiatorId: string, initiatorBookId: string, recipientBookId: string) {
    // Получаем книги для проверки владельцев
    const initiatorBook = await this.bookRepository.findById(initiatorBookId);
    const recipientBook = await this.bookRepository.findById(recipientBookId);

    if (!initiatorBook || !recipientBook) {
      throw new Error('One or both books not found');
    }

    // Проверяем, что инициатор является владельцем своей книги
    if (initiatorBook.currentOwnerId !== initiatorId) {
      throw new Error('You can only propose trades with your own books');
    }

    // Получаем recipientId из книги
    const recipientId = recipientBook.currentOwnerId;

    // Проверяем, что обмен не предлагается самому себе
    if (initiatorId === recipientId) {
      throw new Error('Cannot propose trade to yourself');
    }

    // Проверяем доступность для обмена
    if (!initiatorBook.isForTrade || !recipientBook.isForTrade) {
      throw new Error('One or both books are not available for trade');
    }

    // Проверяем, нет ли дублирующих обменов
    const existingTrade = await this.tradeRepository.checkExistingTrade(initiatorBookId, recipientBookId);
    if (existingTrade) {
      throw new Error('Trade with these books already exists');
    }

    return await this.tradeRepository.create({
      initiatorId,
      initiatorBookId,
      recipientId,
      recipientBookId,
      status: 'pending'
    });
  }
}
```

## Репозитории (Repositories)

### Book Repository (`bookRepository.ts`)

```typescript
export class BookRepository {
  async findAll(filters: {
    search?: string;
    genre?: string;
    forSale?: boolean;
    forTrade?: boolean;
  } = {}): Promise<Book[]> {
    const where: any = {};

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { author: { [Op.iLike]: `%${filters.search獵}%` } }
      ];
    }

    if (filters.genre) where.genre = filters.genre;
    if (filters.forSale !== undefined) where.isForSale = filters.forSale;
    if (filters.forTrade !== undefined) where.isForTrade = filters.forTrade;

    return await Book.findAll({
      where,
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id: string): Promise<Book | null> {
    return await Book.findByPk(id, {
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }]
    });
  }

  async create(bookData: any): Promise<Book> {
    return await Book.create(bookData);
  }

  async update(id: string, bookData: any): Promise<Book | null> {
    const book = await Book.findByPk(id);
    if (!book) return null;
    return await book.update(bookData);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Book.destroy({ where: { id } });
    return deleted > 0;
  }

  async findByOwner(ownerId: string): Promise<Book[]> {
    return await Book.findAll({
      where: { currentOwnerId: ownerId },
      include: [{
        model: User,
        as: 'currentOwner',
        attributes: ['id', 'name', 'avatarUrl']
      }]
    });
  }
}
```

**Ответственность:**
- Работа с базой данных через Sequelize
- Выполнение запросов (SELECT, INSERT, UPDATE, DELETE)
- Использование include для загрузки связей
- Применение фильтров и сортировок

## Middleware

### Аутентификация (`middleware/auth.ts`)

```typescript
export const authenticateToken = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

## REST API Эндпоинты

### База URL: `http://localhost:3001/api`

### Аутентификация
- `POST /auth/register` - регистрация
- `POST /auth/login` - вход в систему

### Книги
- `GET /books` - получить все книги (с фильтрами)
- `GET /books/:id` - получить книгу по ID
- `POST /books` - создать книгу (требует токен)
- `PUT /books/:id` - обновить книгу (требует токен)
- `DELETE /books/:id` - удалить книгу (требует токен)
- `GET /books/user/my-books` - мои книги (требует токен)

### Пользователи
- `GET /users` - все пользователи (требует токен)
- `GET /users/profile` - мой профиль (требует токен)
- `GET /users/:id` - пользователь по ID (требует токен)
- `PUT /users/profile` - обновить профиль (требует токен)
- `POST /users/balance/top-up` - пополнить баланс (требует токен)
- `DELETE /users/:id` - удалить пользователя (требует токен, только админ)

### Обмены
- `GET /trades/my-trades` - мои обмены (требует токен)
- `GET /trades/incoming` - входящие запросы (требует токен)
- `GET /trades/outgoing` - исходящие запросы (требует токен)
- `POST /trades/propose` - предложить обмен (требует токен)
- `PUT /trades/:id/respond` - ответить на обмен (требует токен)
- `DELETE /trades/:id/cancel` - отменить обмен (требует токен)

### Health Check
- `GET /health` - проверка работоспособности API

## Тестирование в Postman

### 1. Регистрация
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 2. Вход
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. Создать книгу
```
POST http://localhost:3001/api/books
Authorization: Bearer <ваш_токен>
Content-Type: application/json

{
  "title": "Война и мир",
  "author": "Лев Толстой",
  "description": "Эпический роман",
  "isForSale": true,
  "isForTrade": false,
  "priceValue": 500,
  "publicationYear": 1869,
  "genre": "Роман"
}
```

## Результат лабораторной работы

✅ Создана полная архитектура REST API  
✅ Реализована маршрутизация для всех ресурсов  
✅ Созданы контроллеры для обработки запросов  
✅ Реализована бизнес-логика в сервисах  
✅ Созданы репозитории для работы с БД  
✅ Добавлена JWT аутентификация  
✅ Реализована проверка прав доступа  
✅ API протестирован в Postman  

## Файлы проекта

**Routes:**
- `src/api/routes/authRoutes.ts`
- `src/api/routes/bookRoutes.ts`
- `src/api/routes/userRoutes.ts`
- `src/api/routes/tradeRoutes.ts`

**Controllers:**
- `src/api/controllers/authController.ts`
- `src/api/controllers/bookController.ts`
- `src/api/controllers/userController.ts`
- `src/api/controllers/tradeController.ts`

**Services:**
- `src/api/services/authService.ts credentialed
- `src/api/services/bookService.ts`
- `src/api/services/userService.ts`
- `src/api/services/tradeService.ts`

**Repositories:**
- `src/api/repositories/userRepository.ts`
- `src/api/repositories/bookRepository.ts`
- `src/api/repositories/tradeRepository.ts`

