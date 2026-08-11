-- ============================================================================
-- 0004 — AnonChat: the account expires too
--
-- Posts and messages already expired after 24 hours. The account outlived them,
-- which made the retention rule a detail rather than the product. Now the whole
-- identity goes: profile, posts, likes, comments, conversations, messages, and
-- the auth user itself.
--
-- Table names stay `talkapo_*`. They are what production is running against,
-- and renaming live tables means a window where the deployed build queries
-- relations that no longer exist. The demo is called AnonChat; the schema
-- remembers what it was called first. That costs a comment, not a migration.
--
-- TWO PARTS, and the second is easy to skip:
--   1. this file
--   2. enabling pg_cron, at the bottom — without it nothing is ever swept and
--      accounts simply live forever while appearing to expire
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profiles get a lifetime
-- ---------------------------------------------------------------------------

alter table public.talkapo_profiles
  add column if not exists expires_at timestamptz not null default now() + interval '24 hours';

create index if not exists talkapo_profiles_expires_idx
  on public.talkapo_profiles (expires_at);

-- Backfill anything that predates this migration so nothing is immortal by
-- accident. Existing rows get a full day from now rather than from creation —
-- expiring somebody's account the instant this runs would be a surprise.
update public.talkapo_profiles
  set expires_at = now() + interval '24 hours'
  where expires_at is null;

-- ---------------------------------------------------------------------------
-- 2. An expired account stops being visible immediately
--
-- The sweep runs on a schedule, so there is always a gap between a profile
-- expiring and being deleted. Reads have to honour the deadline themselves,
-- otherwise an account is "gone" for up to ten minutes while still posting.
-- ---------------------------------------------------------------------------

drop policy if exists talkapo_profiles_read on public.talkapo_profiles;

create policy talkapo_profiles_read
  on public.talkapo_profiles for select
  using (public.talkapo_is_live(expires_at));

-- Search stops offering people who have run out. `security definer` means this
-- function bypasses the policy above, so the deadline has to be repeated here
-- rather than inherited — a thing to remember when adding any other definer
-- function that reads profiles.
create or replace function public.talkapo_search_people(term text)
returns table (id uuid, handle text, display_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.handle, p.display_name
  from public.talkapo_profiles p
  where p.user_id is not null
    and public.talkapo_is_live(p.expires_at)
    and p.id is distinct from public.talkapo_me()
    and (
      term is null
      or btrim(term) = ''
      or p.handle ilike '%' || btrim(term) || '%'
      or p.display_name ilike '%' || btrim(term) || '%'
    )
  order by p.handle
  limit 25;
$$;

revoke execute on function public.talkapo_search_people(text) from anon, public;
grant execute on function public.talkapo_search_people(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. How long have I got?
--
-- The UI shows a countdown, and it must come from the same column the sweep
-- reads. A deadline computed in the browser from a signup time would drift
-- from the one actually being enforced.
-- ---------------------------------------------------------------------------

create or replace function public.talkapo_my_expiry()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select p.expires_at
  from public.talkapo_profiles p
  where p.user_id = auth.uid()
  limit 1;
$$;

revoke execute on function public.talkapo_my_expiry() from anon, public;
grant execute on function public.talkapo_my_expiry() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. The sweep
--
-- Deleting the auth user is the whole job: `talkapo_profiles.user_id`
-- references `auth.users` with `on delete cascade`, and every other table
-- cascades from the profile. One delete removes the person entirely.
--
-- Conversations are not owned by either member, so nothing cascades them —
-- they are cleared separately once they have no members left, otherwise the
-- table fills with empty rooms nobody can see or reach.
-- ---------------------------------------------------------------------------

create or replace function public.talkapo_sweep_expired()
returns table (accounts integer, posts integer, messages integer, rooms integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  gone_accounts integer;
  gone_posts integer;
  gone_messages integer;
  gone_rooms integer;
begin
  delete from auth.users u
  where exists (
    select 1
    from public.talkapo_profiles p
    where p.user_id = u.id
      and p.expires_at <= now()
  );
  get diagnostics gone_accounts = row_count;

  -- Anything left behind by an account that never existed as an auth user, plus
  -- content whose own deadline has passed while its author's has not.
  delete from public.talkapo_profiles where expires_at <= now();
  delete from public.talkapo_posts where expires_at <= now();
  get diagnostics gone_posts = row_count;

  delete from public.talkapo_direct_messages where expires_at <= now();
  get diagnostics gone_messages = row_count;

  delete from public.talkapo_comments where expires_at <= now();

  delete from public.talkapo_conversations c
  where not exists (
    select 1 from public.talkapo_conversation_members m where m.conversation_id = c.id
  );
  get diagnostics gone_rooms = row_count;

  return query select gone_accounts, gone_posts, gone_messages, gone_rooms;
end;
$$;

-- Nobody calls this from the browser. It runs on a schedule as the owner.
revoke execute on function public.talkapo_sweep_expired() from anon, authenticated, public;

-- ============================================================================
-- 5. SCHEDULE IT — this part is not optional
--
-- Run the following in the SQL editor. Without it every deadline above is
-- decoration: reads will hide expired rows, but nothing is ever deleted and the
-- claim that the data is gone stops being true.
--
--   create extension if not exists pg_cron;
--
--   select cron.schedule(
--     'anonchat-sweep',
--     '*/10 * * * *',
--     $$select public.talkapo_sweep_expired()$$
--   );
--
-- Check it is registered:
--
--   select jobid, schedule, jobname, active from cron.job;
--
-- See what it has been doing:
--
--   select start_time, status, return_message
--   from cron.job_run_details
--   where jobname = 'anonchat-sweep'
--   order by start_time desc
--   limit 10;
--
-- Run it by hand once, to prove it works:
--
--   select * from public.talkapo_sweep_expired();
--
-- To change the interval later, unschedule first — scheduling the same name
-- twice creates a second job rather than replacing the first:
--
--   select cron.unschedule('anonchat-sweep');
-- ============================================================================
