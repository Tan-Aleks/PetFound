# API Module Notes

## Public and Protected Endpoints
- `GET /api/pets`: публичный список объявлений с фильтрами поиска.
- `GET /api/pets/[id]`: публичная детальная карточка объявления.
- `POST /api/pets`: создание объявления после проверки `NextAuth`-сессии.
- `PATCH /api/pets/[id]`: обновление объявления владельцем.
- `DELETE /api/pets/[id]`: удаление объявления владельцем.
- `POST /api/pet-photos`: серверная загрузка фото в bucket `pet-photos`.
- `GET /api/messages?petId=...`: защищенное чтение сообщений по объявлению.
- `GET /api/messages/conversations`: защищенный список диалогов текущего пользователя.
- `POST /api/messages`: отправка сообщения.
- `POST /api/messages/read`: пометка сообщений прочитанными.
- `POST /api/pets/search-by-image`: AI-поиск по фото одновременно по локальным `pets` и внешним `external_pets`.
- `app/api/auth/[...nextauth]/route.ts`: обработчик `NextAuth`.

## Boundary Rules
- Все приватные операции обязаны проходить через проверку `getAuthorizedUser()`.
- Route handlers используют server-side Supabase client с service-role ключом.
- Клиентские хуки не должны обращаться к чувствительным таблицам напрямую, кроме случаев realtime-подписки, где поток ограничен подпиской на изменения.
- `POST /api/pets/search-by-image` дополнительно синхронизирует найденные пары в `cross_matches` на сервере, не отдавая права записи браузеру.
- Тот же endpoint создает `notifications.match_found` только для новых пар, используя данные `notifications.data` как защиту от дублирующих уведомлений.
