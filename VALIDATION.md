# Валидация - Лабораторная работа #14

## Обзор

В приложение добавлена валидация с использованием библиотеки **Joi**. Валидация применяется ко всем эндпоинтам для обеспечения корректности входящих данных.

## Структура валидации

### Middleware (`src/api/middleware/validation.ts`)

Создан middleware для валидации, который:
- Проверяет body, query параметры и params
- Возвращает понятные сообщения об ошибках
- Останавливает выполнение запроса при ошибках валидации

### Схемы валидации

Созданы отдельные файлы с схемами валидации:
1. **authValidator.ts** - валидация для аутентификации
2. **bookValidator.ts** - валидация для книг  
3. **userValidator.ts** - валидация для пользователей
4. **tradeValidator.ts** - валидация для обменов

## Примеры валидации

### Регистрация пользователя

```typescript
export const registerSchema = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(100)
      .required(),
    password: Joi.string()
      .min(6)
      .max(255)
      .required(),
  }),
};
```

### Создание книги

```typescript
export const createBookSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(1).max(255).required(),
    author: Joi.string().trim().min(1).max(255).required(),
    description: Joi.string().trim().min(1).required(),
    publicationYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 5)
      .required(),
  }),
};
```

## Формат ошибок валидации

При ошибке валидации API возвращает статус **400**:

```json
{
  "error": "Validation error",
  "details": [
    {
      "source": "body",
      "errors": [
        {
          "message": "Username must be at least 3 characters long",
          "path": "username"
        }
      ]
    }
  ]
}
```

## Правила валидации

### Пользователи
- **username**: 3-100 символов, только буквы и цифры
- **password**: минимум 6 символов
- **bio**: максимум 5000 символов

### Книги
- **title**: 1-255 символов
- **author**: 1-255 символов
- **description**: минимум 1 символ
- **publicationYear**: 1000 - текущий год + 5

## Тестирование

Отправьте невалидные данные в Postman для проверки валидации.

