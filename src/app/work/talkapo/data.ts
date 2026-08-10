import { isConfigured, supabaseServer } from "./supabase";

/**
 * Reads for the Talkapo demo.
 *
 * Every function here works in two modes. With a Supabase project configured it
 * queries the real database; without one it returns the same seed content the
 * migration inserts, so a fresh clone of this repo still builds, still
 * prerenders, and still shows a populated feed — just read-only.
 *
 * That is not a mock layer bolted on for tests. It is the difference between a
 * portfolio that survives someone cloning it and one that shows an error page.
 * `isLive` tells the UI which mode it is in so it can say so out loud.
 */

export const BASE = "/work/talkapo";

export type Profile = {
  id: string;
  handle: string;
  displayName: string;
};

export type Post = {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
};

export type Comment = {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
};

export type LobbyMessage = {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
};

/** True when a real project is wired up and reachable from this render. */
export const isLive = isConfigured;

/* Seed cast — mirrors the fixed ids in the migration ---------------------- */

const SEED_PROFILES: Record<string, Profile> = {
  elena: {
    id: "11111111-1111-4111-8111-111111111111",
    handle: "erostova",
    displayName: "Elena Rostova",
  },
  alex: {
    id: "22222222-2222-4222-8222-222222222222",
    handle: "arivera",
    displayName: "Alex Rivera",
  },
  marcus: {
    id: "33333333-3333-4333-8333-333333333333",
    handle: "mthorne",
    displayName: "Marcus Thorne",
  },
  sarah: {
    id: "44444444-4444-4444-8444-444444444444",
    handle: "sarahj",
    displayName: "Sarah Jenkins",
  },
};

/** Fixed offsets rather than absolute dates, so the seed never reads as stale. */
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

const SEED_POSTS: Post[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    author: SEED_PROFILES.elena,
    content:
      "Just dropped a new minimal theme for the dashboard. Let me know what you guys think!",
    createdAt: hoursAgo(2),
    likes: 2,
    comments: 1,
    likedByMe: false,
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    author: SEED_PROFILES.alex,
    content:
      "Loving the kinetic minimal aesthetic. Less is always more. Working on some new UI components tonight.",
    createdAt: hoursAgo(3),
    likes: 0,
    comments: 0,
    likedByMe: false,
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    author: SEED_PROFILES.marcus,
    content:
      "The new routing system is finally merged. Build times are looking 40% faster. Great work everyone!",
    createdAt: hoursAgo(4),
    likes: 2,
    comments: 1,
    likedByMe: false,
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    author: SEED_PROFILES.sarah,
    content: "Coffee and code. Best way to start the morning.",
    createdAt: hoursAgo(5),
    likes: 1,
    comments: 0,
    likedByMe: false,
  },
];

const SEED_COMMENTS: Record<string, Comment[]> = {
  "a1111111-1111-4111-8111-111111111111": [
    {
      id: "c1111111-1111-4111-8111-111111111111",
      author: SEED_PROFILES.marcus,
      content: "The contrast on the sidebar is so much better now.",
      createdAt: hoursAgo(1.5),
    },
  ],
  "a3333333-3333-4333-8333-333333333333": [
    {
      id: "c2222222-2222-4222-8222-222222222222",
      author: SEED_PROFILES.sarah,
      content: "40% is a real number, nice. What did you cut?",
      createdAt: hoursAgo(3),
    },
  ],
};

const SEED_LOBBY: LobbyMessage[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    author: SEED_PROFILES.sarah,
    content: "Hey Alex! How is the new project going?",
    createdAt: hoursAgo(0.33),
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    author: SEED_PROFILES.alex,
    content: "Going great! Just wrapping up the new messaging UI. It looks super sleek.",
    createdAt: hoursAgo(0.3),
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    author: SEED_PROFILES.sarah,
    content: "Oh wow, I can't wait to see it. Are you using the dark mode?",
    createdAt: hoursAgo(0.28),
  },
  {
    id: "b4444444-4444-4444-8444-444444444444",
    author: SEED_PROFILES.alex,
    content: "Yes! Completely dark mode with some glassmorphism effects.",
    createdAt: hoursAgo(0.25),
  },
];

/* Shapes coming back from PostgREST ---------------------------------------- */

type ProfileRow = { id: string; handle: string; display_name: string };

type PostRow = {
  id: string;
  content: string;
  created_at: string;
  talkapo_profiles: ProfileRow | ProfileRow[] | null;
  talkapo_likes: { profile_id: string }[] | null;
  talkapo_comments: { id: string }[] | null;
};

/** PostgREST returns an embedded row as an object or a one-element array. */
function one<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function toProfile(row: ProfileRow | null): Profile {
  return row
    ? { id: row.id, handle: row.handle, displayName: row.display_name }
    : { id: "unknown", handle: "unknown", displayName: "Unknown" };
}

/* Reads -------------------------------------------------------------------- */

/** The signed-in visitor's profile, or null when signed out or unconfigured. */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("talkapo_profiles")
    .select("id, handle, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? toProfile(data) : null;
}

export async function getFeed(): Promise<Post[]> {
  const supabase = await supabaseServer();
  if (!supabase) return SEED_POSTS;

  const me = await getMyProfile();

  const { data, error } = await supabase
    .from("talkapo_posts")
    .select(
      "id, content, created_at, talkapo_profiles!inner(id, handle, display_name), talkapo_likes(profile_id), talkapo_comments(id)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // A misconfigured or unreachable project must not take the page down — the
  // seed content is a better answer than a 500 on somebody's portfolio.
  if (error || !data) return SEED_POSTS;

  return (data as unknown as PostRow[]).map((row) => {
    const likes = row.talkapo_likes ?? [];
    return {
      id: row.id,
      author: toProfile(one(row.talkapo_profiles)),
      content: row.content,
      createdAt: row.created_at,
      likes: likes.length,
      comments: (row.talkapo_comments ?? []).length,
      likedByMe: me ? likes.some((like) => like.profile_id === me.id) : false,
    };
  });
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await supabaseServer();
  if (!supabase) return SEED_COMMENTS[postId] ?? [];

  const { data, error } = await supabase
    .from("talkapo_comments")
    .select("id, content, created_at, talkapo_profiles!inner(id, handle, display_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return SEED_COMMENTS[postId] ?? [];

  return data.map((row) => ({
    id: row.id as string,
    author: toProfile(one(row.talkapo_profiles as ProfileRow | ProfileRow[] | null)),
    content: row.content as string,
    createdAt: row.created_at as string,
  }));
}

/**
 * The lobby. Returns null for a signed-out visitor rather than an empty list —
 * "you cannot see this" and "there is nothing here" are different states and
 * the UI shows different things for them.
 *
 * The check is a courtesy. The real gate is the RLS policy, which refuses the
 * select outright for an anonymous session.
 */
export async function getLobby(): Promise<LobbyMessage[] | null> {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const me = await getMyProfile();
  if (!me) return null;

  const { data, error } = await supabase
    .from("talkapo_lobby_messages")
    .select("id, content, created_at, talkapo_profiles!inner(id, handle, display_name)")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return SEED_LOBBY;

  return data.map((row) => ({
    id: row.id as string,
    author: toProfile(one(row.talkapo_profiles as ProfileRow | ProfileRow[] | null)),
    content: row.content as string,
    createdAt: row.created_at as string,
  }));
}

/* Presentation helpers ------------------------------------------------------ */

/** "2h", "3d" — the compact form the design uses. */
export function shortAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}

/** Clock time for a chat bubble. */
export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * A stable colour pair per handle, so an avatar is recognisable without a
 * photograph. Two hues from one hash keeps the gradient from going muddy.
 */
export function avatarColors(handle: string) {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) hash = (hash * 31 + handle.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return { from: `hsl(${hue} 70% 55%)`, to: `hsl(${(hue + 48) % 360} 70% 38%)` };
}

export function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}
