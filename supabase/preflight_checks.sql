-- Preflight checks before applying hardening changes from schema.sql.
-- Run this in the Supabase SQL editor before applying the updated schema.

-- 1. Rows that would violate NOT NULL constraints.
SELECT 'messages.pet_id IS NULL' AS check_name, COUNT(*) AS invalid_rows
FROM public.messages
WHERE pet_id IS NULL
UNION ALL
SELECT 'messages.sender_id IS NULL', COUNT(*)
FROM public.messages
WHERE sender_id IS NULL
UNION ALL
SELECT 'messages.receiver_id IS NULL', COUNT(*)
FROM public.messages
WHERE receiver_id IS NULL
UNION ALL
SELECT 'notifications.user_id IS NULL', COUNT(*)
FROM public.notifications
WHERE user_id IS NULL
UNION ALL
SELECT 'external_pets.source_id IS NULL', COUNT(*)
FROM public.external_pets
WHERE source_id IS NULL
UNION ALL
SELECT 'cross_matches.internal_pet_id IS NULL', COUNT(*)
FROM public.cross_matches
WHERE internal_pet_id IS NULL
UNION ALL
SELECT 'cross_matches.external_pet_id IS NULL', COUNT(*)
FROM public.cross_matches
WHERE external_pet_id IS NULL;

-- 2. Rows that would violate sender/receiver integrity.
SELECT COUNT(*) AS messages_with_same_sender_and_receiver
FROM public.messages
WHERE sender_id = receiver_id;

-- 3. Orphan checks for key foreign relations.
SELECT 'messages.pet_id -> pets.id' AS check_name, COUNT(*) AS orphan_rows
FROM public.messages m
LEFT JOIN public.pets p ON p.id = m.pet_id
WHERE p.id IS NULL
UNION ALL
SELECT 'messages.sender_id -> profiles.id', COUNT(*)
FROM public.messages m
LEFT JOIN public.profiles p ON p.id = m.sender_id
WHERE p.id IS NULL
UNION ALL
SELECT 'messages.receiver_id -> profiles.id', COUNT(*)
FROM public.messages m
LEFT JOIN public.profiles p ON p.id = m.receiver_id
WHERE p.id IS NULL
UNION ALL
SELECT 'notifications.user_id -> profiles.id', COUNT(*)
FROM public.notifications n
LEFT JOIN public.profiles p ON p.id = n.user_id
WHERE p.id IS NULL
UNION ALL
SELECT 'external_pets.source_id -> external_sources.id', COUNT(*)
FROM public.external_pets ep
LEFT JOIN public.external_sources es ON es.id = ep.source_id
WHERE es.id IS NULL
UNION ALL
SELECT 'cross_matches.internal_pet_id -> pets.id', COUNT(*)
FROM public.cross_matches cm
LEFT JOIN public.pets p ON p.id = cm.internal_pet_id
WHERE p.id IS NULL
UNION ALL
SELECT 'cross_matches.external_pet_id -> external_pets.id', COUNT(*)
FROM public.cross_matches cm
LEFT JOIN public.external_pets ep ON ep.id = cm.external_pet_id
WHERE ep.id IS NULL;

-- 4. Storage bucket presence and visibility.
SELECT id, name, public
FROM storage.buckets
WHERE id = 'pet-photos';

-- 5. Existing storage policies for the bucket.
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    qual ILIKE '%pet-photos%'
    OR with_check ILIKE '%pet-photos%'
  );
