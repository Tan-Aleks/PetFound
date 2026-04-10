# Page: Chat Thread

## Route
- `/chat/[petId]`

## Purpose
- Показывает переписку по конкретному объявлению.

## Data Flow
- Загружает объявление через `GET /api/pets/[id]`.
- Загружает сообщения через `GET /api/messages`.
- Отправляет сообщения через `POST /api/messages`.
- Отмечает сообщения прочитанными через `POST /api/messages/read`.
- Realtime-обновления приходят через Supabase channel.
- Если в query string есть `aiMatch`, страница дополнительно показывает отдельную панель AI-чата по внешнему совпадению.
- AI-панель загружает контекст совпадения через `GET /api/ai-match-chat/[matchId]` и отправляет вопросы через `POST /api/ai-match-chat/[matchId]/message`.
- AI отвечает только по данным конкретного совпадения: сайт, ссылка, локация, контакты и сведения о питомце.
