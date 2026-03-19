# Page: Create

## Route
- `/create`

## Purpose
- Создание объявления о пропавшем или найденном питомце.

## Main Components
- `Header`
- `Input`
- карточки секций формы

## Data Flow
- Фото отправляются через `POST /api/pet-photos`.
- Объявление создается через `POST /api/pets`.
- Доступ зависит от `NextAuth`-сессии.
