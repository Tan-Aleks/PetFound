# Active Context

## Current Focus
- Исправлены проблемы: включены TS/ESLint проверки, удалена legacy docs/memory-bank.

## Current Status
- Реализовано: регистрация/авторизация, каталог объявлений, поиск (текстовый + AI по фото), создание объявлений с фото, детальная карточка, чат, личный кабинет, уведомления, внешние источники.
- TypeScript и ESLint проверки включены и работают (исправлены ошибки типов в api/pets/route.ts, search-by-image/route.ts, create/page.tsx).
- Удалена legacy директория docs/memory-bank.
- В biomes.json отключено правило noExplicitAny для ML библиотеки transformers.

## Completed Work
- Удалены все файлы, связанные с волонтёрами (страница, API, документация)
- Удалена таблица volunteers из schema.sql
- Удалены типы волонтёров из database.types.ts
- Обновлена документация (ТЗ, README, Memory Bank)
- Добавлены переменные NEXTAUTH_SECRET и SUPABASE_SERVICE_ROLE_KEY в .env.local

## Recent Decisions
- Каноническим источником high-level архитектуры считается `docs/README.md`.
- Каноническим источником прогресса проекта считается `memory_bank/projectbrief.md`.
- Функционал волонтёров удалён, так как не требовался по основному ТЗ.
