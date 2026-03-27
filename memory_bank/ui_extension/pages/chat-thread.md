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
