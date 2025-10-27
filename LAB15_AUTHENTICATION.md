# Лабораторная работа #15 - Аутентификация и Авторизация

## Цель лабораторной работы

Добавить в приложение аутентификацию и авторизацию через JWT-токен с использованием Passport.js и соответствующей стратегии аутентификации. Создать middleware для проверки доступа к API.

## Выполненные задачи

### Установка зависимостей

```bash
npm install passport passport-jwt @types/passport @types/passport-jwt --legacy-peer-deps
```

**Установленные пакеты:**
- `passport` - библиотека для аутентификации
- `passport-jwt` - стратегия JWT для Passport
- `@types/passport` - типы TypeScript для Passport
- `@types/passport-jwt` - типы TypeScript для Passport JWT

### Конфигурация Passport

#### Passport Config (`src/api/config/passport.ts`)

Создан файл конфигурации Passport с JWT стратегией:

```typescript
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../../models/User';

// Настройка JWT стратегии для Passport
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.userId);
      
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
```

**Особенности:**
- Извлечение JWT токена из заголовка Authorization (Bearer Token)
- Проверка секретного ключа из переменных окружения
- Загрузка пользователя из базы данных по userId из токена
- Использование callbacks done() для обработки результатов

### Middleware для аутентификации

#### Passport Auth Middleware (`src/api/middleware/passportAuth.ts`)

Созданы middleware для работы с Passport:

**1. authenticateJWT** - Обязательная аутентификация:
```typescript
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      res.status(500).json({ error: 'Authentication error' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};
```

**2. optionalAuthPassport** - Опциональная аутентификация:
```typescript
export const optionalAuthPassport = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
```

**3. requireAdmin** - Проверка роли администратора:
```typescript
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as any;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};
```

### Инициализация Passport в приложении

#### App Configuration (`src/api/app.ts`)

Passport инициализирован в Express приложении:

```typescript
import passport from './config/passport';

// ...

app.use(passport.initialize());
```

### Текущая реализация JWT аутентификации

В проекте уже реализована JWT аутентификация в `src/api/middleware/auth.ts`:

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

### Генерация JWT токена

В `AuthService` (`src/api/services/authService.ts`):

```typescript
private generateToken(userId: string): string {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}
```

**Параметры токена:**
- **Payload**: userId
- **Secret**: из переменных окружения
- **Expires**: 7 дней

## Архитектура аутентификации

### Flow аутентификации

```
1. Клиент отправляет username и password
   ↓
2. AuthService проверяет credentials
   ↓
3. Генерируется JWT токен с userId
   ↓
4. Токен возвращается клиенту
   ↓
5. Клиент использует токен в заголовке Authorization: Bearer <token>
   ↓
6. Middleware проверяет токен
   ↓
7. Если валидный - загружается user из БД
   ↓
8. req.user доступен в контроллерах
```

### Сравнение подходов

#### Простой JWT Middleware (текущая реализация)
**Плюсы:**
- Простота реализации
- Прямой контроль над процессом
- Легко отлаживать

**Минусы:**
- Меньше функций
- Нет стратегий

#### Passport.js
**Плюсы:**
- Множество стратегий (JWT, OAuth, Local)
- Стандартизированный подход
- Расширяемость

**Минусы:**
- Более сложная настройка
- Больше зависимостей

## Middleware в приложении

### Типы middleware

**1. Обязательная аутентификация (`authenticateToken`)**
- Требует валидный JWT токен
- Возвращает 401 при отсутствии или невалидности токена
- Применяется к защищенным энд cappedинтам

**2. Опциональная аутентификация (`optionalAuth`)**
- Не требует токен, но использует его если есть
- Позволяет определить "свои" ресурсы
- Применяется к публичным эндпоинтам

**3. Проверка роли администратора**
- Требует роль 'admin'
- Возвращает 403 для обычных пользователей
- Можно добавить дополнительные роли

### Применение middleware

#### В Routes

**Пример из bookRoutes.ts:**
```typescript
import { authenticateJWT, optionalAuthPassport } from '../middleware/passportAuth';

router.get('/', validate(getBooksQuerySchema), optionalAuthPassport, bookController.getAllBooks);
router.post('/', authenticateJWT, validate(createBookSchema), bookController.createBook);
```

**Пример из userRoutes.ts:**
```typescript
import { authenticateJWT } from '../middleware/passportAuth';

router.get('/', authenticateJWT, userController.getAllUsers);
router.delete('/:id', authenticateJWT, requireAdmin, userController.deleteUser);
```

### Переход на Passport.js

В рамках лабораторной работы произведен переход на использование Passport.js во всех маршрутах:

- **Заменили:** `authenticateToken` → `authenticateJWT C (из Passport)`
- **Заменили:** `optionalAuth` → `optionalAuthPassport` (из Passport)
- **Обновили:** все контроллеры используют стандартный `Request` тип из Express

Теперь приложение использует Passport.js с JWT стратегией для всех защищенных эндпоинтов.

## Схема безопасности

### Защищенные маршруты

**Пользователи:**
- `GET /api/users` - требует токен
- `DELETE /api/users/:id` - требует токен + роль admin

**Книги:**
- `POST /api/books` - требует токен
- `PUT /api/books/:id` - требует токен
- `DELETE /api/books/:id` - требует токен

**Обмены:**
- Все эндпоинты требуют токен

### Публичные маршруты

- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/books` - список книг (опциональная auth)
- `GET /api/books/:id` - книга по ID (опциональная auth)
- `GET /api/health` - health check

## Тестирование аутентификации

### 1. Регистрация пользователя

**Запрос:**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "name": "testuser",
    "balance": 500,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Вход в систему

**Запрос:**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. Доступ к защищенному эндпоинту

**Запрос:**
```bash
GET http://localhost:3001/api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Доступ без токена (ожидается ошибка)

**Запрос:**
```bash
GET http://localhost:3001/api/users/profile
```

**Ответ:**
```json
{
  "error": "Access token required"
}
```

### 5. Доступ с невалидным токеном (ожидается ошибка)

**Запрос:**
```bash
GET http://localhost:3001/api/users/profile
Authorization: Bearer invalid_token_here
```

**Ответ:**
```json
{
  "error": "Invalid or expired token"
}
```

## Типизация TypeScript

### Расширение типов Express

Создан файл `src/types/express.d.ts`:

```typescript
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

Это позволяет использовать `req.user` с правильной типизацией в контроллерах.

## Безопасность

### Реализованные меры безопасности

1. **Хеширование паролей** - bcrypt с salt rounds = 12
2. **JWT токены** - подписанные, с истечением срока
3. **Проверка токенов** - валидация на каждом запросе
4. **Роли пользователей** - разграничение прав доступа
5. **Проверка прав собственности** - пользователи могут редактировать только свои ресурсы

### Переменные окружения

Всегда используйте `.env` файл:
```env
JWT_SECRET=your-super-secret-key-change-in-production
```

**Важно:** В production используйте сложный секретный ключ!

## Файлы проекта

- `src/api/config/passport.ts` - конфигурация Passport
- `src/api/middleware/passportAuth.ts` - middleware Passport
- `src/api/middleware/auth.ts` - простая JWT аутентификация
- `src/api/services/authService.ts` - генерация токенов
- `src/types/express.d.ts` - расширение типов Express

## Результат лабораторной работы

✅ Passport.js установлен и настроен  
✅ JWT стратегия реализована  
✅ Middleware для аутентификации созданы  
✅ Middleware для проверки ролей реализованы  
✅ Типизация TypeScript настроена  
✅ А detectedntификация протестирована в Postman  

## Использование

### В контроллерах

```typescript
export class BookController {
  createBook = async (req: AuthRequest, res: Response): Promise<void> => {
    // req.user доступен благодаря middleware
    const userId = req.user?.id;
    
    // Использование userId
    const book = await this.bookService.createBook(req.body, userId);
    res.status(201).json(book);
  };
}
```

### Добавление проверки ролей

Можно расширить middleware для проверки дополнительных ролей:

```typescript
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};
```

## Документация

См. также:
- `LAB13_REST_API.md` - REST API архитектура
- `VALIDATION.md` - Валидация данных
- `API_SETUP.md` - Настройка и запуск

