-- Enable Row Level Security (RLS) on all public tables for Supabase security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_models" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplication conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON "users";
DROP POLICY IF EXISTS "Users can update own profile" ON "users";
DROP POLICY IF EXISTS "Users can insert own profile" ON "users";

DROP POLICY IF EXISTS "Users can view own conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can insert own conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can update own conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can delete own conversations" ON "conversations";

DROP POLICY IF EXISTS "Users can view own messages" ON "messages";
DROP POLICY IF EXISTS "Users can insert own messages" ON "messages";
DROP POLICY IF EXISTS "Users can update own messages" ON "messages";
DROP POLICY IF EXISTS "Users can delete own messages" ON "messages";

DROP POLICY IF EXISTS "Users can view own attachments" ON "attachments";
DROP POLICY IF EXISTS "Users can insert own attachments" ON "attachments";
DROP POLICY IF EXISTS "Users can delete own attachments" ON "attachments";

DROP POLICY IF EXISTS "Users can view own settings" ON "settings";
DROP POLICY IF EXISTS "Users can update own settings" ON "settings";
DROP POLICY IF EXISTS "Users can insert own settings" ON "settings";

DROP POLICY IF EXISTS "Anyone can view active AI models" ON "ai_models";

-- Create RLS Policies for "users"
CREATE POLICY "Users can view own profile" ON "users"
  FOR SELECT USING ("supabaseId" = auth.uid()::text OR "id" = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON "users"
  FOR UPDATE USING ("supabaseId" = auth.uid()::text OR "id" = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON "users"
  FOR INSERT WITH CHECK ("supabaseId" = auth.uid()::text OR "id" = auth.uid()::text);

-- Create RLS Policies for "conversations"
CREATE POLICY "Users can view own conversations" ON "conversations"
  FOR SELECT USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

CREATE POLICY "Users can insert own conversations" ON "conversations"
  FOR INSERT WITH CHECK (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

CREATE POLICY "Users can update own conversations" ON "conversations"
  FOR UPDATE USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

CREATE POLICY "Users can delete own conversations" ON "conversations"
  FOR DELETE USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

-- Create RLS Policies for "messages"
CREATE POLICY "Users can view own messages" ON "messages"
  FOR SELECT USING (
    "conversationId" IN (
      SELECT c."id" FROM "conversations" c
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own messages" ON "messages"
  FOR INSERT WITH CHECK (
    "conversationId" IN (
      SELECT c."id" FROM "conversations" c
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own messages" ON "messages"
  FOR UPDATE USING (
    "conversationId" IN (
      SELECT c."id" FROM "conversations" c
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own messages" ON "messages"
  FOR DELETE USING (
    "conversationId" IN (
      SELECT c."id" FROM "conversations" c
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

-- Create RLS Policies for "attachments"
CREATE POLICY "Users can view own attachments" ON "attachments"
  FOR SELECT USING (
    "messageId" IN (
      SELECT m."id" FROM "messages" m
      JOIN "conversations" c ON m."conversationId" = c."id"
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own attachments" ON "attachments"
  FOR INSERT WITH CHECK (
    "messageId" IN (
      SELECT m."id" FROM "messages" m
      JOIN "conversations" c ON m."conversationId" = c."id"
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own attachments" ON "attachments"
  FOR DELETE USING (
    "messageId" IN (
      SELECT m."id" FROM "messages" m
      JOIN "conversations" c ON m."conversationId" = c."id"
      JOIN "users" u ON c."userId" = u."id"
      WHERE u."supabaseId" = auth.uid()::text OR u."id" = auth.uid()::text
    )
  );

-- Create RLS Policies for "settings"
CREATE POLICY "Users can view own settings" ON "settings"
  FOR SELECT USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

CREATE POLICY "Users can update own settings" ON "settings"
  FOR UPDATE USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

CREATE POLICY "Users can insert own settings" ON "settings"
  FOR INSERT WITH CHECK (
    "userId" IN (SELECT "id" FROM "users" WHERE "supabaseId" = auth.uid()::text OR "id" = auth.uid()::text)
  );

-- Create RLS Policy for "ai_models"
CREATE POLICY "Anyone can view active AI models" ON "ai_models"
  FOR SELECT USING ("isActive" = true);
