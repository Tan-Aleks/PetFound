-- Postflight checks after applying the updated schema.sql in Supabase.
-- Run this in the Supabase SQL editor after the migration.

-- 1. Validate column nullability.
SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'messages' AND column_name IN ('pet_id', 'sender_id', 'receiver_id'))
    OR (table_name = 'volunteers' AND column_name = 'user_id')
    OR (table_name = 'notifications' AND column_name = 'user_id')
    OR (table_name = 'external_pets' AND column_name = 'source_id')
    OR (table_name = 'cross_matches' AND column_name IN ('internal_pet_id', 'external_pet_id'))
  )
ORDER BY table_name, column_name;

-- 2. Validate presence of the sender/receiver check constraint.
SELECT conname
FROM pg_constraint
WHERE conname = 'messages_sender_receiver_check';

-- 3. Validate RLS and FORCE RLS state.
SELECT
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'pets',
    'messages',
    'volunteers',
    'notifications',
    'external_sources',
    'external_pets',
    'cross_matches'
  )
ORDER BY tablename;

-- 4. Validate expected public SELECT policies for external data.
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('external_sources', 'external_pets', 'cross_matches')
ORDER BY tablename, policyname;

-- 5. Validate storage bucket and policies for pet photos.
SELECT id, name, public
FROM storage.buckets
WHERE id = 'pet-photos';

SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    qual ILIKE '%pet-photos%'
    OR with_check ILIKE '%pet-photos%'
  );

-- 6. Validate indexes added for production read patterns.
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_volunteers_user_id',
    'idx_cross_matches_internal_pet_id',
    'idx_cross_matches_external_pet_id'
  )
ORDER BY indexname;
