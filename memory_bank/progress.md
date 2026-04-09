# Progress

## Control Changes
- `last_checked_commit`: `aa76f6a`
- `checked_at`: `2026-04-09`
- `comparison_result`: Новых коммитов после `aa76f6a` нет; в рабочем дереве остаются локальные правки auth-flow, profile UI, server-side API и документации. В рамках текущей сессии продолжен cleanup: из `NextAuth Credentials` удалена legacy-ветка регистрации, канонический auth-flow зафиксирован в Memory Bank.

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
- Завершен production-hardening Supabase (схема, RLS, bucket).
- Реализован личный кабинет: просмотр/редактирование профиля, управление объявлениями.
- Реализована система уведомлений с dropdown в Header и API для управления.

## Known Issues
- `bunx tsc --noEmit` сейчас падает на уже сгенерированных файлах в `.next/types`, а не на исходниках приложения.
- В репозитории остается legacy-директория `docs/memory-bank`; актуальным источником контекста считается только корневой `memory_bank`.
- `next.config.js` временно игнорирует TypeScript и ESLint ошибки на build.
- **КРИТИЧНО**: В `.env.local` необходимо заменить placeholder-значения на реальные:
  - `SUPABASE_SERVICE_ROLE_KEY` - получить из Supabase Dashboard (Settings > API)
  - `NEXTAUTH_SECRET` - сгенерировать командой `openssl rand -base64 32`

## Changelog
- `2026-04-09`: Для новых AI-совпадений в `cross_matches` сервер автоматически создает `notifications.match_found` без дублей; `components/NotificationDropdown.tsx` теперь показывает ссылки на внешнее совпадение и сайт-источник.
- `2026-04-09`: `app/api/pets/search-by-image/route.ts` теперь синхронизирует визуальные пары `pets <-> external_pets` в `cross_matches`, если AI находит достаточно похожие объявления с противоположными статусами.
- `2026-04-09`: `POST /api/pets/search-by-image` расширен до поиска по `external_pets`; страница `app/search/SearchPageClient.tsx` теперь показывает отдельный блок совпадений с внешних сайтов и суммарную статистику AI-поиска.
- `2026-04-09`: Синхронизированы `memory_bank/projectbrief.md` и `memory_bank/productContext.md` — убраны устаревшие упоминания волонтерских сценариев после удаления этого scope из проекта.
- `2026-04-09`: В `lib/auth.ts` удалена устаревшая ветка `register` из `NextAuth Credentials`; `NextAuth` теперь отвечает только за логин, а регистрация канонически выполняется через `app/api/auth/register/route.ts`.
- `2026-04-07`: Добавлен `app/api/auth/register/route.ts`; страница `app/register/page.tsx` больше не использует `NextAuth Credentials` для регистрации, а создает пользователя через отдельный API и затем выполняет вход.
- `2026-04-07`: Исправлены `app/api/pets/route.ts`, `app/api/pets/[id]/route.ts`, `app/api/pets/search-by-image/route.ts`, `app/api/external-pets/route.ts`, `app/external/page.tsx` — server-side загрузка данных больше не зависит от `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `2026-04-07`: В `lib/auth.ts` добавлен fallback-восстановление записи `profiles` из `Supabase Auth user_metadata`, если пользователь существует в auth, но профиль отсутствует.
- `2026-04-07`: Исправлены server-side маршруты `app/api/notifications/route.ts`, `app/api/profile/pets/route.ts`, `app/api/profile/pets/[id]/route.ts`, `app/api/messages/route.ts`, `app/api/messages/conversations/route.ts` — для авторизованных запросов теперь используется `getSupabaseServer()`, чтобы исключить 500 при отсутствии `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `2026-04-07`: В `app/profile/page.tsx` на страницу личного кабинета добавлен общий `Header`, чтобы сохранить доступ к основному меню.
- `2026-04-07`: В `app/profile/ProfileClient.tsx` поле района проживания в режиме редактирования заменено на выпадающий список на базе `MOSCOW_DISTRICTS`.
- `2026-03-24`: Удалён функционал волонтёров (не требовался по ТЗ). Исправлена проблема с регистрацией/входом - добавлены недостающие переменные окружения.
- `2026-03-20`: D10 завершен. Добавлен AI-поиск по изображению (CLIP через @xenova/transformers), страница внешних источников /external с интеграцией партнерских объявлений.
- `2026-03-20`: D09 завершен. Добавлена система уведомлений (dropdown в Header, API).
- `2026-03-20`: D07 и D08 завершены. Добавлен личный кабинет с просмотром/редактированием профиля и управлением объявлениями. Обновлен Header с учетом авторизации.
- `2026-03-19`: создан канонический корневой `memory_bank`, добавлены `Project Deliverables`, `last_checked_commit`, модульная и UI-документация.
- `2026-03-19`: создан `docs/README.md` как единый high-level источник архитектуры.
- `2026-03-19`: зафиксирован новый контур доступа к данным через server-side API для объявлений и сообщений.
- `2026-03-19`: в `supabase/schema.sql` ужесточены обязательные внешние ключи, добавлены индексы и расширено покрытие RLS для `external_*` и `cross_matches`.
- `2026-03-19`: добавлены `supabase/preflight_checks.sql` и `supabase/postflight_checks.sql` для безопасной проверки миграции и bucket `pet-photos`.
