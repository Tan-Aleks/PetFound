# Progress

## Control Changes
- `last_checked_commit`: `b75cb79`
- `checked_at`: `2026-03-19`
- `comparison_result`: `git log b75cb79..` не вернул новых коммитов на момент проверки

## Completed Milestones
- Реорганизована структура проекта и переход на `bun`.
- Настроены базовые конфигурации Next.js, Tailwind CSS и Biome.
- Реализованы регистрация и вход через `NextAuth` + `Supabase Auth`.
- Главная страница и поиск работают на реальных данных из Supabase.
- Реализовано создание объявления с записью в БД и загрузкой фото в Storage.
- Реализованы карточка питомца, список диалогов и чат по объявлению.
- Внедрена светлая и темная тема.
- Чтение объявлений и приватных сообщений переведено на server-side API.
- Создан канонический корневой `memory_bank` и зафиксирована high-level архитектура в `docs/README.md`.

## In Progress
- Финальная синхронизация `supabase/schema.sql`, `lib/database.types.ts` и RLS-политик.
- Проверка production-конфигурации bucket `pet-photos`.

## Known Issues
- `bunx tsc --noEmit` сейчас падает на уже сгенерированных файлах в `.next/types`, а не на исходниках приложения.
- В репозитории остается legacy-директория `docs/memory-bank`; актуальным источником контекста считается только корневой `memory_bank`.
- `next.config.js` временно игнорирует TypeScript и ESLint ошибки на build.

## Changelog
- `2026-03-19`: создан канонический корневой `memory_bank`, добавлены `Project Deliverables`, `last_checked_commit`, модульная и UI-документация.
- `2026-03-19`: создан `docs/README.md` как единый high-level источник архитектуры.
- `2026-03-19`: зафиксирован новый контур доступа к данным через server-side API для объявлений и сообщений.
