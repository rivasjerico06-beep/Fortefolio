-- ============================================================================
-- Talkapo 0003 — actually lock the RPCs to signed-in callers
--
-- 0002 revoked EXECUTE from PUBLIC and granted it to `authenticated`, which
-- looked sufficient and was not. Supabase ships a default privilege that grants
-- EXECUTE on new functions to `anon`, `authenticated` and `service_role`
-- directly. That is a *separate, explicit* grant to `anon`, so revoking PUBLIC
-- left it untouched — and a signed-out caller could still POST to
-- /rest/v1/rpc/talkapo_search_people and enumerate every account on the demo.
--
-- Revoke from the role by name. Verify with the query at the foot of this file
-- rather than assuming.
-- ============================================================================

revoke execute on function public.talkapo_search_people(text) from anon;
revoke execute on function public.talkapo_start_conversation(uuid) from anon;
revoke execute on function public.talkapo_in_conversation(uuid) from anon;

-- Keep the intended grants explicit, so a later `create or replace` that resets
-- privileges has something to be compared against.
grant execute on function public.talkapo_search_people(text) to authenticated;
grant execute on function public.talkapo_start_conversation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- On `talkapo_profiles` staying world-readable
--
-- It is, deliberately: the feed is public and every post shows its author's
-- name, so an anonymous reader has to be able to resolve profiles. That means
-- handles and display names are discoverable by anyone, which is true of every
-- public social feed and is not what the search RPC was protecting.
--
-- What the RPC protects is the *directory* — a single call listing everyone
-- with an account, which is a different thing from seeing the author of a post
-- you are already reading. Email addresses are in `auth.users` and are not
-- reachable through PostgREST at all.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Check it worked. `anon` should appear nowhere in the output.
--
--   select p.proname, r.rolname, has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can_execute
--   from pg_proc p
--   cross join (values ('anon'), ('authenticated')) as r(rolname)
--   where p.proname in ('talkapo_search_people', 'talkapo_start_conversation')
--   order by p.proname, r.rolname;
--
-- Expected: talkapo_search_people/anon = false, /authenticated = true, and the
-- same shape for talkapo_start_conversation.
-- ---------------------------------------------------------------------------
