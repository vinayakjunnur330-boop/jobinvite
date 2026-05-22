
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- saved careers
create table public.saved_careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_slug text not null,
  title text not null,
  industry text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, career_slug)
);
alter table public.saved_careers enable row level security;
create policy "Users view own saved" on public.saved_careers for select using (auth.uid() = user_id);
create policy "Users insert own saved" on public.saved_careers for insert with check (auth.uid() = user_id);
create policy "Users update own saved" on public.saved_careers for update using (auth.uid() = user_id);
create policy "Users delete own saved" on public.saved_careers for delete using (auth.uid() = user_id);

-- chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index chat_messages_user_conv_idx on public.chat_messages(user_id, conversation_id, created_at);
alter table public.chat_messages enable row level security;
create policy "Users view own messages" on public.chat_messages for select using (auth.uid() = user_id);
create policy "Users insert own messages" on public.chat_messages for insert with check (auth.uid() = user_id);
create policy "Users delete own messages" on public.chat_messages for delete using (auth.uid() = user_id);
