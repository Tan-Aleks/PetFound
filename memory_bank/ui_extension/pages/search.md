# Page: Search

## Route
- `/search`

## Purpose
- Предоставляет расширенный поиск объявлений.

## Main Components
- `Header`
- `SearchForm`
- `PetCard`

## Data Flow
- Параметры поиска читаются из query string.
- Результаты загружаются через `useSearchPets()` -> `GET /api/pets`.
