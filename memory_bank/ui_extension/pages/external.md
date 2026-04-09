# Page: External Sources

## Route
- `/external`

## Purpose
- Показывает объявления из партнерских источников и список активных внешних площадок.

## Main Components
- `Header`
- Список источников
- Карточки внешних объявлений

## Data Flow
- Источники и объявления загружаются server-side через `getSupabaseServer()`.
- Данные берутся из таблиц `external_sources` и `external_pets`.
- AI-поиск по фото на странице `/search` может направлять пользователя к найденным карточкам из этих источников.
