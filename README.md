# Appointy — Платформа онлайн-записи для мастеров

Современная full-stack платформа для управления записями на услуги бьюти-мастеров.

## 📋 Содержание

- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [API Endpoints](#api-endpoints)
- [Модули](#модули)

## 🛠 Технологии

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **React Query (TanStack Query)**
- **Zustand** (state management)
- **class-variance-authority** (UI variants)

### Backend
- **Express.js** (TypeScript)
- **Prisma ORM**
- **PostgreSQL**
- **JWT** (auth)
- **bcryptjs** (password hashing)
- **Zod** (validation)

## 📁 Структура проекта

```
qwen-app/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── app/                   # Next.js pages
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   └── services/
│   │   ├── masters/
│   │   │   └── [id]/
│   │   ├── onboarding/
│   │   ├── search/
│   │   └── layout.tsx
│   ├── features/              # Feature-based modules
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   └── store/
│   │   └── providers.tsx
│   ├── server/                # Express backend
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── shared/
│   │   ├── api/
│   │   ├── lib/
│   │   ├── types/
│   │   └── ui/
│   └── types/
├── .env                       # Environment variables
├── mcp_config.json           # MCP servers config
├── package.json
└── tsconfig.json
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

```bash
# Настройте DATABASE_URL в .env
DATABASE_URL=postgresql://user:password@localhost:5432/appointy

# Примените схему
npx prisma migrate dev
npx prisma generate
```

### 3. Запуск приложения

```bash
# Development mode (frontend + backend)
npm run dev

# Только frontend
npm run dev:web

# Только backend
npm run dev:server
```

### 4. Переменные окружения

Создайте `.env` файл:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/appointy

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `POST /api/auth/refresh` — Обновление токена
- `POST /api/auth/logout` — Выход
- `GET /api/auth/me` — Текущий пользователь

### Onboarding
- `POST /api/onboarding/master` — Создание профиля мастера
- `POST /api/onboarding/client` — Создание профиля клиента
- `GET /api/onboarding/profile` — Получение профиля

### Services (Master only)
- `GET /api/services` — Список услуг мастера
- `POST /api/services` — Создание услуги
- `PATCH /api/services/:id` — Обновление услуги
- `DELETE /api/services/:id` — Удаление услуги

### Search
- `GET /api/search/masters` — Поиск мастеров
- `GET /api/search/masters/:id` — Профиль мастера

## 📦 Модули

### Auth
- Регистрация/Вход с JWT
- Refresh токены
- Role-based доступ (MASTER/CLIENT)

### Onboarding
- Мастер: имя, описание, формат работы, опыт, настройки записи
- Клиент: имя, интересы

### Master Dashboard
- CRUD услуг
- Управление расписанием
- Просмотр записей

### Search
- Фильтрация по формату, цене, рейтингу
- Сортировка
- Пагинация

## 🎨 Design System

Следуйте спецификации из `spec.md`:

- **Шрифты**: Nunito (заголовки), Nunito Sans (текст), Fira Code (код)
- **Кнопки**: высота 52px, радиус 16px
- **Карточки**: радиус 40px + тень
- **Поля ввода**: радиус 8px

## 📝 MCP Серверы

Проект использует MCP для интеграции с внешними сервисами:

- **Figma-Context-MCP** — дизайн-токены
- **PostgreSQL** — работа с БД
- **Hyperbrowser** — веб-автоматизация

## 🔐 Безопасность

- Пароли хешируются через bcryptjs
- JWT access + refresh токены
- Валидация данных через Zod
- Role-based авторизация

## 📄 License

MIT
