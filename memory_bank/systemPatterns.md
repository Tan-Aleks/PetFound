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
- AI-поиск по фото выполняется на сервере и сравнивает эмбеддинг загруженного изображения одновременно с локальными `pets` и внешними `external_pets`.
- После AI-поиска сервер формирует пары `pets <-> external_pets` с противоположными статусами и сохраняет подтвержденные визуальные связи в `cross_matches`.
- Уведомления о совпадениях создаются сервером только один раз на пару `internal_pet_id + external_pet_id`; ссылка на внешний источник хранится в `notifications.data` и отображается в UI dropdown.

## UI Composition
- Страницы в `app/` собираются из небольших клиентских контейнеров и общих компонентов.
- `Header`, `SearchForm`, `PetCard` и `ThemeToggle` образуют основной UI-каркас MVP.
- Темизация поддерживается на уровне глобальных токенов и компонентов.

## Security Model
- Основные таблицы работают с включенным `FORCE ROW LEVEL SECURITY`.
- Server-side service-role клиент используется как доверенный слой для операций, которые не должны выполняться напрямую из браузера.
- Bucket `pet-photos` оставлен публичным на чтение, но без browser-политик записи.

## Auth Flow Pattern
- `NextAuth Credentials` отвечает только за вход пользователя по email/паролю и восстановление отсутствующей записи `profiles` при логине.
- Регистрация вынесена в отдельный route handler `POST /api/auth/register`, который создает пользователя через service-role Supabase client и синхронизирует профиль.

## Key Integration Boundaries
- `app/api/*` — граница между UI и защищенными операциями с данными.
- `lib/auth.ts` и `lib/server-auth.ts` — граница авторизации и проверки сессии.
- `supabase/schema.sql` и `lib/database.types.ts` должны синхронизироваться как единая контрактная пара.
- `supabase/preflight_checks.sql` и `supabase/postflight_checks.sql` используются как закрытый контур проверки перед и после применения схемы в реальном Supabase-проекте.
