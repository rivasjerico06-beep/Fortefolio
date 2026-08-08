import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { listPostsPage } from "../api";
import { PageTitle } from "../chrome";
import { BASE, POSTS_PER_PAGE, gallery, posts } from "../data";

export const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

/** Page 1 lives at /blog; every later page at /blog/page/N. */
export const pageHref = (page: number) =>
  page <= 1 ? `${BASE}/blog` : `${BASE}/blog/page/${page}`;

/**
 * The journal archive, shared by /blog and /blog/page/[n] so the two routes
 * cannot drift apart.
 */
export async function ArchiveView({ page }: { page: number }) {
  const { posts: pagePosts } = await listPostsPage(page);

  return (
    <>
      <PageTitle
        index="03"
        label="Journal"
        title="Journal"
        intro="What is on the grinder, what changed this week, and the occasional explanation of why we do something the way we do."
      />

      <div className="mx-auto max-w-[90rem] px-5 sm:px-10">
        {page > 1 && (
          <p className="lc-eyebrow mt-10">
            Page {page} of {totalPages}
          </p>
        )}

        <div className="mt-14 space-y-16 sm:space-y-24">
          {pagePosts.map((post, index) => {
            const image = gallery[(index + (page - 1) * POSTS_PER_PAGE) % gallery.length];
            return (
              <Reveal as="article" key={post.slug} kind="up" className="lc-row group">
                <Link
                  href={`${BASE}/blog/${post.slug}`}
                  className="grid gap-8 lg:grid-cols-12 lg:gap-16"
                >
                  <div className="lg:col-span-5">
                    <div
                      className="lc-frame relative aspect-[4/3] overflow-hidden border"
                      style={{ borderColor: "var(--lc-line)" }}
                    >
                      <Image
                        src={image.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <p className="lc-eyebrow">
                      {post.date} · {post.category}
                      {post.comments.length > 0 &&
                        ` · ${post.comments.length} comment${post.comments.length === 1 ? "" : "s"}`}
                    </p>
                    <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] leading-[1] transition-colors group-hover:text-[var(--lc-accent-text)]">
                      {post.title}
                    </h2>
                    <p
                      className="mt-5 max-w-xl text-[17px] leading-relaxed"
                      style={{ color: "var(--lc-fg-2)" }}
                    >
                      {post.excerpt}
                    </p>
                    <span
                      className="lc-eyebrow mt-7 inline-flex items-center gap-2"
                      style={{ color: "var(--lc-accent-text)" }}
                    >
                      Read it
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </span>
                    <span
                      aria-hidden
                      className="lc-row-rule mt-6 block h-px"
                      style={{ backgroundColor: "var(--lc-accent)" }}
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Journal pages"
            className="mt-20 flex items-center justify-between gap-6 border-t py-10"
            style={{ borderColor: "var(--lc-line)" }}
          >
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="lc-eyebrow group inline-flex items-center gap-2"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-500 group-hover:-translate-x-1"
                  aria-hidden
                />
                Newer
              </Link>
            ) : (
              <span />
            )}

            <ol className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={pageHref(n)}
                    aria-current={n === page ? "page" : undefined}
                    className={`lc-swatch lc-eyebrow inline-flex size-9 items-center justify-center border ${
                      n === page ? "" : "lc-btn-ghost"
                    }`}
                    style={
                      n === page
                        ? {
                            borderColor: "var(--lc-accent-solid)",
                            backgroundColor: "var(--lc-accent-solid)",
                            color: "#fff",
                          }
                        : undefined
                    }
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ol>

            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="lc-eyebrow group inline-flex items-center gap-2"
              >
                Older
                <ArrowRight
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </>
  );
}
