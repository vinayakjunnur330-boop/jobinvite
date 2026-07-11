-- Fix profiles public SELECT policy (in code as migration)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Scope chat_messages SELECT policy to authenticated role explicitly
DROP POLICY IF EXISTS "Users view own messages" ON public.chat_messages;
CREATE POLICY "Users view own messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Explicitly deny UPDATE on chat_messages (messages are immutable by design)
DROP POLICY IF EXISTS "No updates on chat messages" ON public.chat_messages;
CREATE POLICY "No updates on chat messages" ON public.chat_messages
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);