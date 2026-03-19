# System Patterns

## High-Level Architecture
- `Next.js 15 App Router` используется как единая точка для UI и серверных API-маршрутов.
- `Supabase` отвечает за PostgreSQL, Storage и realtime-каналы.
- `NextAuth` управляет пользовательской сессией и связывает браузерный UX с server-side операциями.

## Data Access Patterns
- Публичные списки и детали объявлений читаются через route handlers (`/api/pets`, `/api/pets/[id]`).
- Приватные данные чата читаются через server-side API с проверкой `NextAuth`-сессии.
- Запись объявлений, сообщений, загрузка фото и отметка сообщений прочитанными выполняются только через сервер.
- Браузерный Supabase client используется для realtime-подписки и для ограниченного auth flow.

## UI Composition
- Страницы в `app/` собираются из небольших клиентских контейнеров и общих компонентов.
- `Header`, `SearchForm`, `PetCard` и `ThemeToggle` образуют основной UI-каркас MVP.
- Темизация поддерживается на уровне глобальных токенов и компонентов.

## Security Model
- Основные таблицы работают с включенным `FORCE ROW LEVEL SECURITY`.
- Server-side service-role клиент используется как доверенный слой для операций, которые не должны выполняться напрямую из браузера.
- Bucket `pet-photos` оставлен публичным на чтение, но без browser-политик записи.

## Key Integration Boundaries
- `app/api/*` — граница между UI и защищенными операциями с данными.
- `lib/auth.ts` и `lib/server-auth.ts` — граница авторизации и проверки сессии.
- `supabase/schema.sql` и `lib/database.types.ts` должны синхронизироваться как единая контрактная пара.
