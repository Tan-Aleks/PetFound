# Tech Context

## Stack
- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`
- `NextAuth 4`
- `Supabase JS 2`
- `Bun`
- `Biome`

## Environment
- Основная рабочая ОС пользователя: Windows.
- Команды в терминале должны выполняться в формате PowerShell.
- Dev-сервером управляет пользователь; агент не запускает и не останавливает его самостоятельно.

## Configuration Notes
- Публичные переменные: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Серверные переменные: `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`.
- `next.config.js` сейчас допускает build с игнорированием ESLint и TypeScript ошибок, что полезно как временный стабилизатор, но требует отдельного возврата к строгой сборке.

## Quality Rules
- Пакетный менеджер проекта: `bun`.
- После изменений в коде обязателен прогон `biome`.
- Markdown-файлы не должны прогоняться через Biome.
- Для ручных правок файлов используется патч-редактирование.
