import { POSTS_PER_PAGE, menu, posts, type MenuSection, type Post } from "./data";

/**
 * The read seam.
 *
 * Every accessor is `async` even though it resolves local data today. That is
 * deliberate: when the menu and the journal move to a CMS, only this file
 * changes — no page and no component has to learn about loading states,
 * because they are already awaiting.
 *
 * Server-only by convention. Nothing here should be imported by a client
 * component: `data.ts` carries every post body and every image import, so
 * pulling it into a client bundle would ship the whole site's content to the
 * browser. Writes go through `actions.ts` instead.
 */

export async function getMenu(): Promise<MenuSection[]> {
  return menu;
}

export async function listPosts(): Promise<Post[]> {
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function listComments(slug: string) {
  const post = await getPost(slug);
  return post?.comments ?? [];
}

/** One page of the journal archive, newest first. */
export async function listPostsPage(page: number) {
  const all = await listPosts();
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: all.slice(start, start + POSTS_PER_PAGE),
    page,
    totalPages,
  };
}

/** The post either side of this one, for article footer navigation. */
export async function getNeighbours(slug: string) {
  const all = await listPosts();
  const index = all.findIndex((post) => post.slug === slug);
  return {
    newer: index > 0 ? all[index - 1] : null,
    older: index >= 0 && index < all.length - 1 ? all[index + 1] : null,
  };
}
