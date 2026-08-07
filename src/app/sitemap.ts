import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { projects } from "@/lib/projects";
import { BASE as LUMEN, POSTS_PER_PAGE, posts } from "./work/lumen-cafe/data";
import { products } from "./work/lumen-cafe/shop/catalog";

/**
 * Every page that should be discoverable, at its own address.
 *
 * The demo sites are listed as well as the case studies. They are real pages
 * with real content, so leaving them out would hide a good half of the work
 * from search — and a viewer who lands on the café's menu from a search result
 * can still navigate up into the portfolio from the bar at the top.
 *
 * Derived from the same data the pages render, so a new post cannot be added
 * without appearing here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const blogPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/projects", priority: 0.8 },
    { path: "/about", priority: 0.8 },
    { path: "/contact", priority: 0.8 },

    ...projects.flatMap((project) => [
      { path: `/projects/${project.slug}`, priority: 0.7 },
      { path: `/work/${project.slug}`, priority: 0.6 },
    ]),

    // The café demo is a whole site of its own
    { path: `${LUMEN}/menu`, priority: 0.6 },
    { path: `${LUMEN}/about`, priority: 0.5 },
    { path: `${LUMEN}/visit`, priority: 0.5 },
    { path: `${LUMEN}/blog`, priority: 0.5 },
    ...Array.from({ length: blogPages - 1 }, (_, index) => ({
      path: `${LUMEN}/blog/page/${index + 2}`,
      priority: 0.3,
    })),
    ...posts.map((post) => ({ path: `${LUMEN}/blog/${post.slug}`, priority: 0.4 })),

    // The shop. Checkout is deliberately absent — it is noindex, and a basket
    // is per-visitor, so there is nothing there for a crawler to find.
    { path: `${LUMEN}/shop`, priority: 0.6 },
    ...products.map((product) => ({ path: `${LUMEN}/shop/${product.slug}`, priority: 0.5 })),
  ];

  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    priority,
  }));
}
