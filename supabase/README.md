# Supabase setup for AnonChat

AnonChat is the one demo in this portfolio with a real database behind it.
Everything else is static. Follow this once and the demo goes live; skip it and
the site still builds and deploys — AnonChat just runs read-only on placeholder
content and says so on the page.

Total time: about five minutes.

## 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Name it whatever you like (`anonchat` is fine), pick the region closest to
   your visitors, and let it generate a database password. You will not need
   that password for this setup — save it somewhere anyway.
3. Wait for provisioning to finish, about two minutes.

## 2. Run the migrations, in order

Open **SQL Editor → New query**, paste each file, hit **Run**, and check for
`Success. No rows returned` before moving to the next.

| File                                                                                      | What it does                                                         |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`0001_talkapo.sql`](migrations/0001_talkapo.sql)                                         | Tables, policies, rate-limit triggers, 24-hour expiry on posts       |
| [`0002_talkapo_direct_messages.sql`](migrations/0002_talkapo_direct_messages.sql)         | Private conversations, people search, and it deletes the seeded cast |
| [`0003_talkapo_lock_down_rpcs.sql`](migrations/0003_talkapo_lock_down_rpcs.sql)           | Revokes the search RPC from `anon` — **security fix, do not skip**   |
| [`0004_anonchat_ephemeral_accounts.sql`](migrations/0004_anonchat_ephemeral_accounts.sql) | Expires the account itself, not just its posts                       |

Each is safe to run more than once.

The table names are `talkapo_*` because that is what the demo was called first.
Renaming live tables means a window where the deployed build queries relations
that no longer exist, which is a poor trade for a cosmetic fix.

### 2a. Schedule the sweep — 0004 does nothing without this

`0004` gives every account a deadline and writes the function that collects
expired ones, but it cannot schedule itself. Run this once:

```sql
create extension if not exists pg_cron;

select cron.schedule(
  'anonchat-sweep',
  '*/10 * * * *',
  $$select public.talkapo_sweep_expired()$$
);
```

Confirm it registered, and that it is running:

```sql
select jobid, schedule, jobname, active from cron.job;

select start_time, status, return_message
from cron.job_run_details
where jobname = 'anonchat-sweep'
order by start_time desc
limit 5;
```

**Skipping this is the worst of both worlds.** Reads already filter on the
deadline, so an expired account vanishes from the interface — while every row
it ever wrote stays in the database forever. The app would be telling people
their data is gone while quietly keeping it.

To prove it works without waiting for the timer:

```sql
select * from public.talkapo_sweep_expired();
```

## 3. Turn off email confirmation

**Authentication → Sign In / Providers → Email**, and switch
**Confirm email** off.

This matters. Supabase's built-in mailer is rate-limited to a few messages an
hour on the free tier, so with confirmation on, the third person to try your
demo cannot get in. Nobody should be putting a real address into a portfolio
demo anyway.

While you are there, leave **Enable email provider** on — that is the sign-up
method the demo uses.

## 4. Copy the keys

**Project Settings → API** gives you two values:

| Dashboard label                    | Environment variable            |
| ---------------------------------- | ------------------------------- |
| Project URL                        | `NEXT_PUBLIC_SUPABASE_URL`      |
| `anon` / `public` (or Publishable) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Locally, copy `.env.example` to `.env.local` and paste them in. `.env.local` is
git-ignored.

On Vercel, add both under **Settings → Environment Variables** for Production,
Preview and Development, then redeploy. Environment variables are read at build
time, so an existing deployment will not pick them up until it rebuilds.

> **Never add the `service_role` key.** It bypasses row-level security
> completely, and anything prefixed `NEXT_PUBLIC_` is compiled into the
> JavaScript every visitor downloads. The demo does not use it and does not
> need it.

## 5. Check it

Load `/work/anonchat`. The pill in the feed header should read **Live** rather
than **Read-only**. Create an account, post something, then open **Messages**,
search for another account and start a thread. Sign out and confirm Messages
refuses you again. The rail should show how long your account has left.

## What the policies actually do

The point of the demo is that the login gate is enforced by the database, not
by the interface:

| Table                          | Signed out         | Signed in                            |
| ------------------------------ | ------------------ | ------------------------------------ |
| `talkapo_profiles`             | read (unexpired)   | read, write own row                  |
| `talkapo_posts`                | read (unexpired)   | read, insert own, delete own         |
| `talkapo_comments`             | read (unexpired)   | read, insert own, delete own         |
| `talkapo_likes`                | read               | read, like/unlike as self            |
| `talkapo_conversations`        | **nothing at all** | read only the ones you are in        |
| `talkapo_conversation_members` | **nothing at all** | read only your own conversations     |
| `talkapo_direct_messages`      | **nothing at all** | read/insert only in your own threads |

You can prove the private rows from the SQL editor:

```sql
-- as an anonymous caller, both return zero rather than everyone's messages
set local role anon;
select count(*) from public.talkapo_direct_messages;
select count(*) from public.talkapo_conversations;
```

Note there is no insert policy on conversations or members at all. Threads are
created only through `talkapo_start_conversation`, so nobody can add themselves
to a conversation they were not invited into.

## Housekeeping

Every row a visitor creates carries `expires_at = now() + 24 hours`, and so does
the profile itself. Two separate things enforce it, and both are needed:

- **Reads filter on the deadline.** An expired account and its posts stop being
  visible the moment they lapse, without waiting for anything to run.
- **The sweep deletes them.** `talkapo_sweep_expired()` removes the auth user,
  which cascades to the profile, posts, likes, comments and both sides of every
  private conversation, then clears any conversation left with no members.

Reads alone would mean data hidden but kept forever. The sweep alone would leave
a window where a lapsed account can still post. See step 2a for scheduling it —
it is not automatic.

There are no seed rows any more. `0002` deletes the fixture cast, because once
accounts are real a fake one that cannot reply is just a prop. A fresh database
starts empty and fills up as people use it, then empties itself again.

## Cost

This fits inside the Supabase free tier comfortably. The one thing to watch is
that free projects **pause after a week of inactivity**; if your demo goes quiet
and then a recruiter opens it, the first request wakes the project and takes a
few seconds. Restore it from the dashboard, or keep it warm by loading the page
occasionally.
