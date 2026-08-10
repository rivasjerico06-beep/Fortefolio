# Supabase setup for Talkapo

Talkapo is the one demo in this portfolio with a real database behind it.
Everything else is static. Follow this once and the demo goes live; skip it and
the site still builds and deploys — Talkapo just runs read-only on seed content
and says so on the page.

Total time: about five minutes.

## 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Name it whatever you like (`talkapo` is fine), pick the region closest to
   your visitors, and let it generate a database password. You will not need
   that password for this setup — save it somewhere anyway.
3. Wait for provisioning to finish, about two minutes.

## 2. Run the migration

Open **SQL Editor → New query**, paste the entire contents of
[`migrations/0001_talkapo.sql`](migrations/0001_talkapo.sql), and hit **Run**.

That creates the tables, the row-level security policies, the rate-limit
triggers, the 24-hour expiry and the seeded cast. It is safe to run more than
once — every object is created `if not exists` and the seed rows use fixed ids
with `on conflict do nothing`.

You should see `Success. No rows returned`.

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

Load `/work/talkapo`. The pill in the feed header should read **Live** rather
than **Read-only**. Create an account, post something, and open **Messages** —
the lobby should be reachable. Sign out and it should refuse you again.

## What the policies actually do

The point of the demo is that the login gate is enforced by the database, not
by the interface:

| Table                    | Signed out         | Signed in                    |
| ------------------------ | ------------------ | ---------------------------- |
| `talkapo_profiles`       | read               | read, write own row          |
| `talkapo_posts`          | read (unexpired)   | read, insert own, delete own |
| `talkapo_comments`       | read (unexpired)   | read, insert own, delete own |
| `talkapo_likes`          | read               | read, like/unlike as self    |
| `talkapo_lobby_messages` | **nothing at all** | read (unexpired), insert own |

You can prove the last row from the SQL editor:

```sql
-- as an anonymous caller, this returns zero rows rather than the seeded chat
set local role anon;
select count(*) from public.talkapo_lobby_messages;
```

## Housekeeping

Anything a visitor writes carries `expires_at = now() + 24 hours` and stops
being readable the moment it lapses, because the read policies filter on it.
Seed rows have `expires_at = null` and never expire, so the feed is never empty.

Actually deleting the lapsed rows is `select public.talkapo_sweep();`. The
migration schedules it hourly if `pg_cron` is available, and nothing depends on
it having run — it only reclaims space.

## Cost

This fits inside the Supabase free tier comfortably. The one thing to watch is
that free projects **pause after a week of inactivity**; if your demo goes quiet
and then a recruiter opens it, the first request wakes the project and takes a
few seconds. Restore it from the dashboard, or keep it warm by loading the page
occasionally.
