# Page: Chat List

## Route
- `/chat`

## Purpose
- Показывает сгруппированный список диалогов текущего пользователя.

## Data Flow
- Требует активную сессию.
- Загружает диалоги через `GET /api/messages/conversations`.
