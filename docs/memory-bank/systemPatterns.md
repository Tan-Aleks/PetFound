# System Patterns

## Architecture
- **Framework**: Next.js 15 (App Router).
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage).
- **Styling**: Tailwind CSS + shadcn/ui.
- **Logic**: Client-side hooks for data fetching (`usePets`), Server Components for SEO and initial load.

## Technical Patterns
- **Directory Structure**: Корневой проект с четким разделением на `app/`, `components/`, `lib/`, `hooks/`.
- **Database**: Реляционная схема в Supabase с использованием RLS политик.
- **Linting/Formatting**: Biome для обеспечения чистоты и единообразия кода.
- **Package Management**: Bun для быстрой установки и запуска.

## Key Integrations
- **Supabase**: Хранение данных, фото и аутентификация.
- **NextAuth.js**: Управление сессиями пользователей.
