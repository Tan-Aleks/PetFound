# Page: Register

## Route
- `/register`

## Purpose
- Регистрация нового пользователя.

## Data Flow
- Отправляет данные в `NextAuth` credentials provider в режиме регистрации.
- Создает пользователя в `Supabase Auth` и профиль в таблице `profiles`.
