-- ============================================================================
-- Talkapo 0002 — private 1:1 messages, user search, and removing the fixtures
--
-- Run after 0001, the same way: SQL Editor → New query → paste → Run.
-- Re-runnable.
--
-- Three changes:
--
--   1. The public lobby becomes private conversations between two real
--      accounts. This is what the original design drew; the lobby was a
--      stand-in for it.
--   2. Profiles become searchable, so you can find somebody and message them.
--      Only accounts that actually exist — the search never returns fixtures.
--   3. The seeded cast is deleted. They were never real accounts and you
--      cannot message them, so leaving them in a people search would be
--      offering conversations that can never happen.
--
-- NOTE: deleting the seed profiles cascades to their posts, comments and
-- likes, so the feed starts empty until a real account posts.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Conversations
--
-- A conversation is a row plus two member rows, rather than a pair of columns
-- on one table. Two columns would mean every query needs
-- `(a = me or b = me)` and every insert needs the pair sorted to avoid
-- duplicates in the other order. Members also leave room for a group thread
-- later without a migration.
-- ---------------------------------------------------------------------------
create table if not exists public.talkapo_conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.talkapo_conversation_members (
  conversation_id uuid not null references public.talkapo_conversations (id) on delete cascade,
  profile_id      uuid not null references public.talkapo_profiles (id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table if not exists public.talkapo_direct_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.talkapo_conversations (id) on delete cascade,
  author_id       uuid not null references public.talkapo_profiles (id) on delete cascade,
  content         text not null check (char_length(content) between 1 and 2000),
  created_at      timestamptz not null default now(),
  expires_at      timestamptz default (now() + interval '24 hours')
);

create index if not exists talkapo_dm_conversation_idx
  on public.talkapo_direct_messages (conversation_id, created_at);
create index if not exists talkapo_members_profile_idx
  on public.talkapo_conversation_members (profile_id);

-- ---------------------------------------------------------------------------
-- Membership check
--
-- `security definer` is load-bearing, not incidental. The policy on
-- `talkapo_conversation_members` needs to ask "is the caller a member of this
-- conversation?", which is a query against the very table being filtered — as
-- an ordinary subquery that recurses until Postgres gives up with
-- "infinite recursion detected in policy". Running it as the definer skips RLS
-- on the inner read and breaks the loop.
--
-- It is still safe: it only ever reports on the *caller's* own membership,
-- because `talkapo_me()` resolves from their session and cannot be passed in.
-- ---------------------------------------------------------------------------
create or replace function public.talkapo_in_conversation(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.talkapo_conversation_members m
    where m.conversation_id = conv
      and m.profile_id = public.talkapo_me()
  );
$$;

-- ---------------------------------------------------------------------------
-- Opening a conversation
--
-- One round trip, and idempotent: messaging the same person twice reopens the
-- existing thread instead of starting a second one. Doing this from the client
-- would be three statements with no transaction around them, and a race would
-- leave two threads between the same pair.
--
-- `security definer` again, because inserting the *other* person's member row
-- is not something the caller's own policies allow — and must not be, or
-- anyone could add themselves to your conversations.
-- ---------------------------------------------------------------------------
create or replace function public.talkapo_start_conversation(other_profile uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me   uuid := public.talkapo_me();
  conv uuid;
begin
  if me is null then
    raise exception 'You need an account to start a conversation.'
      using errcode = 'insufficient_privilege';
  end if;

  if other_profile = me then
    raise exception 'You cannot message yourself.'
      using errcode = 'check_violation';
  end if;

  -- Only real accounts. A fixture has no auth user and could never reply.
  if not exists (
    select 1 from public.talkapo_profiles
    where id = other_profile and user_id is not null
  ) then
    raise exception 'That account does not exist.'
      using errcode = 'no_data_found';
  end if;

  -- An existing pair: exactly these two members and nobody else.
  select m1.conversation_id into conv
  from public.talkapo_conversation_members m1
  join public.talkapo_conversation_members m2
    on m2.conversation_id = m1.conversation_id
  where m1.profile_id = me
    and m2.profile_id = other_profile
    and (
      select count(*) from public.talkapo_conversation_members m3
      where m3.conversation_id = m1.conversation_id
    ) = 2
  limit 1;

  if conv is not null then
    return conv;
  end if;

  insert into public.talkapo_conversations default values returning id into conv;
  insert into public.talkapo_conversation_members (conversation_id, profile_id)
  values (conv, me), (conv, other_profile);

  return conv;
end;
$$;

-- ---------------------------------------------------------------------------
-- People search
--
-- Fixtures are excluded by `user_id is not null` rather than by `is_seed`,
-- because the question the caller is really asking is "can I message them?" —
-- and the answer is no for anything without an account behind it, however it
-- got there.
-- ---------------------------------------------------------------------------
create or replace function public.talkapo_search_people(term text)
returns table (id uuid, handle text, display_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.handle, p.display_name
  from public.talkapo_profiles p
  where p.user_id is not null
    and p.id is distinct from public.talkapo_me()
    and (
      term is null
      or btrim(term) = ''
      or p.handle       ilike '%' || btrim(term) || '%'
      or p.display_name ilike '%' || btrim(term) || '%'
    )
  order by p.handle
  limit 20;
$$;

-- Signed-out visitors have no one to message, so both of these stay behind an
-- account. Revoking from `anon` alone would not do it: Postgres grants EXECUTE
-- to PUBLIC on a new function, and `anon` inherits that. Drop the PUBLIC grant
-- first, then hand it back to `authenticated` only.
revoke execute on function public.talkapo_search_people(text) from public;
revoke execute on function public.talkapo_start_conversation(uuid) from public;
grant execute on function public.talkapo_search_people(text) to authenticated;
grant execute on function public.talkapo_start_conversation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Rate limiting and row-level security
-- ---------------------------------------------------------------------------
drop trigger if exists talkapo_dm_rate_limit on public.talkapo_direct_messages;
create trigger talkapo_dm_rate_limit
  before insert on public.talkapo_direct_messages
  for each row execute function public.talkapo_rate_limit();

alter table public.talkapo_conversations        enable row level security;
alter table public.talkapo_conversation_members enable row level security;
alter table public.talkapo_direct_messages      enable row level security;

-- A conversation, its membership and its messages are visible only to the two
-- people in it. There is no policy that lets anyone else read any of it, and
-- no "public" branch to get wrong later.
drop policy if exists talkapo_conversations_read on public.talkapo_conversations;
create policy talkapo_conversations_read
  on public.talkapo_conversations for select to authenticated
  using (public.talkapo_in_conversation(id));

drop policy if exists talkapo_members_read on public.talkapo_conversation_members;
create policy talkapo_members_read
  on public.talkapo_conversation_members for select to authenticated
  using (public.talkapo_in_conversation(conversation_id));

drop policy if exists talkapo_dm_read on public.talkapo_direct_messages;
create policy talkapo_dm_read
  on public.talkapo_direct_messages for select to authenticated
  using (
    public.talkapo_in_conversation(conversation_id)
    and public.talkapo_is_live(expires_at)
  );

-- You may only send as yourself, and only into a thread you are part of.
drop policy if exists talkapo_dm_insert_own on public.talkapo_direct_messages;
create policy talkapo_dm_insert_own
  on public.talkapo_direct_messages for insert to authenticated
  with check (
    author_id = public.talkapo_me()
    and public.talkapo_in_conversation(conversation_id)
  );

-- Deliberately absent: any insert policy on conversations or members. Threads
-- are only ever created through `talkapo_start_conversation`, so nobody can
-- add themselves to a conversation they were not invited into.

-- ---------------------------------------------------------------------------
-- Realtime + housekeeping
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.talkapo_direct_messages;
  end if;
exception
  when duplicate_object then null;
end
$$;

create or replace function public.talkapo_sweep()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.talkapo_posts           where expires_at is not null and expires_at < now();
  delete from public.talkapo_comments        where expires_at is not null and expires_at < now();
  delete from public.talkapo_direct_messages where expires_at is not null and expires_at < now();
$$;

-- ---------------------------------------------------------------------------
-- Retire the lobby
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication_tables
             where pubname = 'supabase_realtime'
               and schemaname = 'public'
               and tablename = 'talkapo_lobby_messages') then
    alter publication supabase_realtime drop table public.talkapo_lobby_messages;
  end if;
exception
  when others then null;
end
$$;

drop table if exists public.talkapo_lobby_messages;

-- ---------------------------------------------------------------------------
-- Remove everything that is not a real account
--
-- Deleting the profile cascades to that person's posts, comments, likes,
-- conversation membership and messages. The feed will be empty afterwards
-- until somebody with an account posts, which is the point.
-- ---------------------------------------------------------------------------
delete from public.talkapo_profiles where is_seed = true or user_id is null;

-- Empty conversations left behind by a deleted member
delete from public.talkapo_conversations c
where not exists (
  select 1 from public.talkapo_conversation_members m where m.conversation_id = c.id
);
