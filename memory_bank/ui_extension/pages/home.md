# Page: Home

## Route
- `/`

## Purpose
- Показывает ценностное предложение платформы.
- Даёт быстрый вход в поиск и публикацию объявления.
- Отображает последние объявления.

## Main Components
- `Header`
- `SearchForm`
- `PetCard`

## Data Flow
- Получает последние объявления через `usePets()` -> `GET /api/pets`.
