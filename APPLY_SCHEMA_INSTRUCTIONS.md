# Инструкция по применению обновлённой схемы БД

## Шаг 1: Откройте SQL Editor в Supabase

Перейдите по ссылке:
https://supabase.com/dashboard/project/aoujapzceetqhpkfcpqe/sql/new

## Шаг 2: Скопируйте и выполните следующий SQL

```sql
-- Удаление таблицы volunteers
DROP TABLE IF EXISTS volunteers CASCADE;

-- Обновление типа notification_type (удаление volunteer_alert)
DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM (
  'match_found',
  'message_received'
);

-- Пересоздание таблицы notifications с новым типом
ALTER TABLE notifications 
  ALTER COLUMN type TYPE text;

ALTER TABLE notifications 
  ALTER COLUMN type TYPE notification_type 
  USING type::notification_type;
```

## Шаг 3: Нажмите кнопку "Run" (или Ctrl+Enter)

После выполнения SQL:
1. Перезапустите сервер разработки (остановите и запустите заново)
2. Попробуйте зарегистрироваться на сайте
3. Регистрация и вход должны работать!

## Что было исправлено:

✅ Добавлен NEXTAUTH_SECRET в .env.local
✅ Добавлен SUPABASE_SERVICE_ROLE_KEY в .env.local
✅ Удалён весь код, связанный с волонтёрами
✅ Обновлена документация

Осталось только применить SQL выше, и всё заработает!
