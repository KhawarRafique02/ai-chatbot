-- ── 1. Profiles ──
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Conversations ──
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  mode TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Messages ──
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS Enable ──
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: profiles ──
CREATE POLICY "own profile select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── RLS Policies: conversations ──
CREATE POLICY "own conv select" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own conv insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own conv update" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own conv delete" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- ── RLS Policies: messages ──
CREATE POLICY "own msg select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "own msg insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "own msg delete" ON messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- ── Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
