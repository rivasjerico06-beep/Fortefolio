-- ============================================================================
-- Talkapo — schema, row-level security, rate limiting and seed data
--
-- Run this once against a new Supabase project: SQL Editor → New query → paste
-- → Run. It is written to be re-runnable; every object is created with
-- `if not exists` and the seed rows use fixed ids with `on conflict do nothing`.
--
-- The access model, which is the whole point of the demo:
--
--   * the FEED is world-readable. Anyone can read posts, comments and like
--     counts without an account, so the page server-renders for a visitor who
--     never signs in — and for a crawler.
--   * WRITING anything (post, comment, like) requires an account.
--   * the LOBBY is not readable at all without an account. That gate lives in
--     the policy below, not in the UI, so hiding the tab is a courtesy rather
--     than the actual protection.
--
-- Everything a visitor creates expires after 24 hours. Seed rows have a NULL
-- `expires_at` and never expire, so the demo is never empty.
-- ============================================================================

-- Tables are prefixed `talkapo_` so this project can host other demos later
-- without a name collision.

-- ---------------------------------------------------------------------------
-- Profiles
--
-- Deliberately NOT keyed on auth.users. A profile has an optional `user_id`,
-- which is null for the seeded cast. Keying the table on auth.users would mean
-- the seed characters needed fake auth rows to exist, and deleting a real user
-- would be tangled up with fixtures.
-- ---------------------------------------------------------------------------
create table if not exists public.talkapo_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users (id) on delete cascade,
  handle       text not null unique
               check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null
               check (char_length(display_name) between 1 and 40),
  avatar_url   text,
  is_seed      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Posts, comments, likes, lobby messages
-- ---------------------------------------------------------------------------
create table if not exists public.talkapo_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.talkapo_profiles (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 280),
  created_at timestamptz not null default now(),
  -- NULL means "never expires" and is reserved for seed rows
  expires_at timestamptz default (now() + interval '24 hours')
);

create table if not exists public.talkapo_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.talkapo_posts (id) on delete cascade,
  author_id  uuid not null references public.talkapo_profiles (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 280),
  created_at timestamptz not null default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

create table if not exists public.talkapo_likes (
  post_id    uuid not null references public.talkapo_posts (id) on delete cascade,
  profile_id uuid not null references public.talkapo_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.talkapo_lobby_messages (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.talkapo_profiles (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

create index if not exists talkapo_posts_created_idx
  on public.talkapo_posts (created_at desc);
create index if not exists talkapo_comments_post_idx
  on public.talkapo_comments (post_id, created_at);
create index if not exists talkapo_lobby_created_idx
  on public.talkapo_lobby_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The caller's profile id, or null when signed out. `stable` so Postgres can
-- cache it per statement instead of re-running it for every row it checks.
create or replace function public.talkapo_me()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.talkapo_profiles where user_id = auth.uid();
$$;

-- Live rows only: seeds (null) plus anything not yet past its expiry.
create or replace function public.talkapo_is_live(expires_at timestamptz)
returns boolean
language sql
immutable
as $$
  select expires_at is null or expires_at > now();
$$;

-- ---------------------------------------------------------------------------
-- Rate limiting
--
-- A trigger rather than a policy: a policy can only say yes or no, while this
-- can return a message the UI is able to show the person who tripped it.
-- ---------------------------------------------------------------------------
create or replace function public.talkapo_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
  ceiling integer := 5;   -- rows per author per minute
begin
  execute format(
    'select count(*) from public.%I where author_id = $1 and created_at > now() - interval ''1 minute''',
    tg_table_name
  )
  into recent
  using new.author_id;

  if recent >= ceiling then
    raise exception
      'Slow down — % posts a minute is the limit here.', ceiling
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists talkapo_posts_rate_limit on public.talkapo_posts;
create trigger talkapo_posts_rate_limit
  before insert on public.talkapo_posts
  for each row execute function public.talkapo_rate_limit();

drop trigger if exists talkapo_comments_rate_limit on public.talkapo_comments;
create trigger talkapo_comments_rate_limit
  before insert on public.talkapo_comments
  for each row execute function public.talkapo_rate_limit();

drop trigger if exists talkapo_lobby_rate_limit on public.talkapo_lobby_messages;
create trigger talkapo_lobby_rate_limit
  before insert on public.talkapo_lobby_messages
  for each row execute function public.talkapo_rate_limit();

-- ---------------------------------------------------------------------------
-- Row-level security
--
-- Every table denies everything until a policy allows it. The client only ever
-- holds the anon key, so these policies are the actual security boundary — not
-- the application code.
-- ---------------------------------------------------------------------------
alter table public.talkapo_profiles       enable row level security;
alter table public.talkapo_posts          enable row level security;
alter table public.talkapo_comments       enable row level security;
alter table public.talkapo_likes          enable row level security;
alter table public.talkapo_lobby_messages enable row level security;

-- Profiles: everyone can read (the feed shows names), you may only create and
-- edit the row that carries your own auth id.
drop policy if exists talkapo_profiles_read on public.talkapo_profiles;
create policy talkapo_profiles_read
  on public.talkapo_profiles for select
  using (true);

drop policy if exists talkapo_profiles_insert_self on public.talkapo_profiles;
create policy talkapo_profiles_insert_self
  on public.talkapo_profiles for insert to authenticated
  with check (user_id = auth.uid() and is_seed = false);

drop policy if exists talkapo_profiles_update_self on public.talkapo_profiles;
create policy talkapo_profiles_update_self
  on public.talkapo_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_seed = false);

-- Posts: world-readable while live; only an author may add or remove their own.
drop policy if exists talkapo_posts_read on public.talkapo_posts;
create policy talkapo_posts_read
  on public.talkapo_posts for select
  using (public.talkapo_is_live(expires_at));

drop policy if exists talkapo_posts_insert_own on public.talkapo_posts;
create policy talkapo_posts_insert_own
  on public.talkapo_posts for insert to authenticated
  with check (author_id = public.talkapo_me());

drop policy if exists talkapo_posts_delete_own on public.talkapo_posts;
create policy talkapo_posts_delete_own
  on public.talkapo_posts for delete to authenticated
  using (author_id = public.talkapo_me());

-- Comments: same shape as posts.
drop policy if exists talkapo_comments_read on public.talkapo_comments;
create policy talkapo_comments_read
  on public.talkapo_comments for select
  using (public.talkapo_is_live(expires_at));

drop policy if exists talkapo_comments_insert_own on public.talkapo_comments;
create policy talkapo_comments_insert_own
  on public.talkapo_comments for insert to authenticated
  with check (author_id = public.talkapo_me());

drop policy if exists talkapo_comments_delete_own on public.talkapo_comments;
create policy talkapo_comments_delete_own
  on public.talkapo_comments for delete to authenticated
  using (author_id = public.talkapo_me());

-- Likes: counts are public, but a like belongs to exactly one profile and only
-- that profile can add or take it back.
drop policy if exists talkapo_likes_read on public.talkapo_likes;
create policy talkapo_likes_read
  on public.talkapo_likes for select
  using (true);

drop policy if exists talkapo_likes_insert_own on public.talkapo_likes;
create policy talkapo_likes_insert_own
  on public.talkapo_likes for insert to authenticated
  with check (profile_id = public.talkapo_me());

drop policy if exists talkapo_likes_delete_own on public.talkapo_likes;
create policy talkapo_likes_delete_own
  on public.talkapo_likes for delete to authenticated
  using (profile_id = public.talkapo_me());

-- Lobby: the one table a signed-out visitor cannot read at all. This is the
-- gate behind "Have an account? Log in" on the Messages tab — the UI hides the
-- content, and this makes the hiding true.
drop policy if exists talkapo_lobby_read on public.talkapo_lobby_messages;
create policy talkapo_lobby_read
  on public.talkapo_lobby_messages for select to authenticated
  using (public.talkapo_is_live(expires_at));

drop policy if exists talkapo_lobby_insert_own on public.talkapo_lobby_messages;
create policy talkapo_lobby_insert_own
  on public.talkapo_lobby_messages for insert to authenticated
  with check (author_id = public.talkapo_me());

-- ---------------------------------------------------------------------------
-- Realtime
--
-- Realtime respects RLS, so a signed-out socket gets post events and no lobby
-- events, exactly like the REST reads above.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.talkapo_posts;
    alter publication supabase_realtime add table public.talkapo_likes;
    alter publication supabase_realtime add table public.talkapo_lobby_messages;
  end if;
exception
  when duplicate_object then null;  -- already published, fine
end
$$;

-- ---------------------------------------------------------------------------
-- Housekeeping
--
-- Expired rows are invisible the moment they lapse because the read policies
-- filter on `expires_at`. This only reclaims the space. Schedule it if the
-- pg_cron extension is enabled; otherwise call it whenever you like — nothing
-- depends on it having run.
-- ---------------------------------------------------------------------------
create or replace function public.talkapo_sweep()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.talkapo_posts          where expires_at is not null and expires_at < now();
  delete from public.talkapo_comments       where expires_at is not null and expires_at < now();
  delete from public.talkapo_lobby_messages where expires_at is not null and expires_at < now();
$$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'talkapo-sweep', '17 * * * *', 'select public.talkapo_sweep()'
    );
  end if;
exception
  when others then null;  -- cron not available on this plan; the filter still hides expired rows
end
$$;

-- ---------------------------------------------------------------------------
-- Seed cast and content
--
-- Fixed ids so re-running changes nothing. `expires_at` is null throughout, so
-- the feed still has something in it after every visitor post has lapsed.
-- Avatars are intentionally absent: the app draws initials, so the demo makes
-- no third-party image request and a new signup looks the same as the cast.
-- ---------------------------------------------------------------------------
insert into public.talkapo_profiles (id, handle, display_name, is_seed) values
  ('11111111-1111-4111-8111-111111111111', 'erostova', 'Elena Rostova',  true),
  ('22222222-2222-4222-8222-222222222222', 'arivera',  'Alex Rivera',    true),
  ('33333333-3333-4333-8333-333333333333', 'mthorne',  'Marcus Thorne',  true),
  ('44444444-4444-4444-8444-444444444444', 'sarahj',   'Sarah Jenkins',  true)
on conflict (id) do nothing;

insert into public.talkapo_posts (id, author_id, content, created_at, expires_at) values
  ('a1111111-1111-4111-8111-111111111111',
   '11111111-1111-4111-8111-111111111111',
   'Just dropped a new minimal theme for the dashboard. Let me know what you guys think!',
   now() - interval '2 hours', null),
  ('a2222222-2222-4222-8222-222222222222',
   '22222222-2222-4222-8222-222222222222',
   'Loving the kinetic minimal aesthetic. Less is always more. Working on some new UI components tonight.',
   now() - interval '3 hours', null),
  ('a3333333-3333-4333-8333-333333333333',
   '33333333-3333-4333-8333-333333333333',
   'The new routing system is finally merged. Build times are looking 40% faster. Great work everyone!',
   now() - interval '4 hours', null),
  ('a4444444-4444-4444-8444-444444444444',
   '44444444-4444-4444-8444-444444444444',
   'Coffee and code. Best way to start the morning.',
   now() - interval '5 hours', null)
on conflict (id) do nothing;

insert into public.talkapo_comments (id, post_id, author_id, content, created_at, expires_at) values
  ('c1111111-1111-4111-8111-111111111111',
   'a1111111-1111-4111-8111-111111111111',
   '33333333-3333-4333-8333-333333333333',
   'The contrast on the sidebar is so much better now.',
   now() - interval '90 minutes', null),
  ('c2222222-2222-4222-8222-222222222222',
   'a3333333-3333-4333-8333-333333333333',
   '44444444-4444-4444-8444-444444444444',
   '40% is a real number, nice. What did you cut?',
   now() - interval '3 hours', null)
on conflict (id) do nothing;

insert into public.talkapo_likes (post_id, profile_id) values
  ('a1111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'),
  ('a1111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333'),
  ('a3333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111'),
  ('a3333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444'),
  ('a4444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222')
on conflict do nothing;

insert into public.talkapo_lobby_messages (id, author_id, content, created_at, expires_at) values
  ('b1111111-1111-4111-8111-111111111111',
   '44444444-4444-4444-8444-444444444444',
   'Hey Alex! How is the new project going?',
   now() - interval '20 minutes', null),
  ('b2222222-2222-4222-8222-222222222222',
   '22222222-2222-4222-8222-222222222222',
   'Going great! Just wrapping up the new messaging UI. It looks super sleek.',
   now() - interval '18 minutes', null),
  ('b3333333-3333-4333-8333-333333333333',
   '44444444-4444-4444-8444-444444444444',
   'Oh wow, I can''t wait to see it. Are you using the dark mode?',
   now() - interval '17 minutes', null),
  ('b4444444-4444-4444-8444-444444444444',
   '22222222-2222-4222-8222-222222222222',
   'Yes! Completely dark mode with some glassmorphism effects.',
   now() - interval '15 minutes', null)
on conflict (id) do nothing;
