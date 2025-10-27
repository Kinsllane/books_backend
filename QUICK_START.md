# Быстрый старт - REST API

## 🚀 Запуск за 3 шага

### Шаг 1: Создайте `.env` файл

В корне проекта создайте файл `.env`:

```env
DB_NAME=bookswap
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-here
PORT=3001
NODE_ENV=development
```

### Шаг 2: Создайте базу данных

```bash
psql -U postgres
CREATE DATABASE bookswap;
\q
```

### Шаг 3: Запустите API

```bash
# В одном терминале - Frontend
npm start

# В другом терминале - Backend
npm run api:dev
```

## 🧪 Быстрое тестирование

Откройте браузер: http://localhost:3001/api/health

Ответ:
```json
{
  "status": "OK",
  "database": "Connected"
}
```

## 📝 Тестовый пользователь

После запуска используйте:
- Имя: `admin`
- Пароль: `admin123`

## 📚 Полная документация

- `API_SETUP.md` - подробная инструкция
- `README.md` - полная документация API
- `CHANGELOG.md` - что было исправлено

