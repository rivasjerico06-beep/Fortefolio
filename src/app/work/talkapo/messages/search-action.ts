"use server";

import { searchPeople } from "../data";
import type { Profile } from "../data";

/**
 * People search, exposed to the client as an action.
 *
 * A thin wrapper so the search box can call it directly, rather than the
 * client holding a Supabase handle and running the RPC itself. Same reasoning
 * as every other write in this demo: the session stays in an httpOnly cookie
 * and the browser never needs a token.
 *
 * The rules about who is searchable — real accounts only, never yourself — are
 * in the database function, not here.
 */
export async function findPeople(term: string): Promise<Profile[]> {
  return searchPeople(term);
}
