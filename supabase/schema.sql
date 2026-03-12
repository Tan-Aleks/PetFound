-- Создание таблиц для платформы поиска питомцев

-- Профили пользователей (связь с Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  phone VARCHAR(20),
  district VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица объявлений о питомцах
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100),
  type VARCHAR(10) NOT NULL CHECK (type IN ('dog', 'cat', 'small')),
  breed VARCHAR(100),
  color VARCHAR(100) NOT NULL,
  size VARCHAR(10) NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  district VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('lost', 'found')),
  description TEXT NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  reward INTEGER,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений между пользователями
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Таблица волонтеров
CREATE TABLE volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  districts TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица внешних источников данных
CREATE TABLE external_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_parsed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица объявлений с внешних сайтов
CREATE TABLE external_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES external_sources(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  type VARCHAR(10) NOT NULL CHECK (type IN ('dog', 'cat', 'small')),
  breed VARCHAR(100),
  color VARCHAR(100) NOT NULL,
  size VARCHAR(10) NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  district VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('lost', 'found')),
  description TEXT NOT NULL,
  contact_info JSONB NOT NULL,
  photos TEXT[] DEFAULT '{}',
  source_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_id, external_id)
);

-- Таблица совпадений между платформами
CREATE TABLE cross_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  external_pet_id UUID REFERENCES external_pets(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3,2) NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('visual', 'text', 'combined')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('match_found', 'message_received', 'volunteer_alert')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации поиска
CREATE INDEX idx_pets_type ON pets(type);
CREATE INDEX idx_pets_district ON pets(district);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_date ON pets(date);
CREATE INDEX idx_pets_created_at ON pets(created_at);
CREATE INDEX idx_external_pets_type ON external_pets(type);
CREATE INDEX idx_external_pets_district ON external_pets(district);
CREATE INDEX idx_external_pets_status ON external_pets(status);
CREATE INDEX idx_messages_pet_id ON messages(pet_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_pets_updated_at BEFORE UPDATE ON external_pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политики для объявлений о питомцах
CREATE POLICY "Anyone can view pets" ON pets
  FOR SELECT USING (true);

CREATE POLICY "Users can create pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для сообщений
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Политики для уведомлений
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Вставка тестовых данных районов Москвы
INSERT INTO external_sources (name, url, active) VALUES
  ('Авито', 'https://www.avito.ru', true),
  ('VK Группы', 'https://vk.com', true),
  ('Telegram каналы', 'https://t.me', true);
