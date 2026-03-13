-- Schema for the PetFound MVP.
-- Browser reads still use the public Supabase client.
-- All writes that affect protected data must go through server-side route
-- handlers with NextAuth session checks and a service-role Supabase client.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_type') THEN
    CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'small');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_size') THEN
    CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_status') THEN
    CREATE TYPE pet_status AS ENUM ('lost', 'found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'match_found',
      'message_received',
      'volunteer_alert'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_type') THEN
    CREATE TYPE match_type AS ENUM ('visual', 'text', 'combined');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  phone VARCHAR(20),
  district VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100),
  type pet_type NOT NULL,
  breed VARCHAR(100),
  color VARCHAR(100) NOT NULL,
  size pet_size NOT NULL,
  district VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  status pet_status NOT NULL,
  description TEXT,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  reward INTEGER,
  photos TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  districts TEXT[] DEFAULT '{}'::TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_parsed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS external_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES external_sources(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  type pet_type NOT NULL,
  breed VARCHAR(100),
  color VARCHAR(100) NOT NULL,
  size pet_size NOT NULL,
  district VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  status pet_status NOT NULL,
  description TEXT NOT NULL,
  contact_info JSONB NOT NULL,
  photos TEXT[] DEFAULT '{}'::TEXT[],
  source_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_id, external_id)
);

CREATE TABLE IF NOT EXISTS cross_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  external_pet_id UUID REFERENCES external_pets(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3, 2) NOT NULL,
  match_type match_type NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_district ON pets(district);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_date ON pets(date);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_pet_id ON messages(pet_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_external_pets_type ON external_pets(type);
CREATE INDEX IF NOT EXISTS idx_external_pets_district ON external_pets(district);
CREATE INDEX IF NOT EXISTS idx_external_pets_status ON external_pets(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON pets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_external_pets_updated_at ON external_pets;
CREATE TRIGGER update_external_pets_updated_at
BEFORE UPDATE ON external_pets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE pets FORCE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
ALTER TABLE volunteers FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view pets" ON pets;
CREATE POLICY "Anyone can view pets" ON pets
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can create pets" ON pets;
CREATE POLICY "Users can create pets" ON pets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;
CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view related messages" ON messages;
CREATE POLICY "Users can view related messages" ON messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Receivers can mark messages as read" ON messages;
CREATE POLICY "Receivers can mark messages as read" ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = receiver_id
    AND sender_id IS NOT NULL
    AND pet_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can view their volunteer profile" ON volunteers;
CREATE POLICY "Users can view their volunteer profile" ON volunteers
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their volunteer profile" ON volunteers;
CREATE POLICY "Users can manage their volunteer profile" ON volunteers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_profile_previews(profile_ids UUID[])
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  email VARCHAR(255)
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.email
  FROM profiles AS p
  WHERE p.id = ANY(profile_ids);
$$;

REVOKE ALL ON FUNCTION get_profile_previews(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_profile_previews(UUID[]) TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', TRUE)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public can view pet photos" ON storage.objects;
CREATE POLICY "Public can view pet photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Users can upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete pet photos" ON storage.objects;

-- No INSERT/UPDATE/DELETE policy is created for `pet-photos`.
-- Direct browser uploads are intentionally blocked; writes go through the
-- server-side API with the service-role client.

INSERT INTO external_sources (name, url, active)
VALUES
  ('Авито', 'https://www.avito.ru', TRUE),
  ('VK Группы', 'https://vk.com', TRUE),
  ('Telegram каналы', 'https://t.me', TRUE)
ON CONFLICT DO NOTHING;
