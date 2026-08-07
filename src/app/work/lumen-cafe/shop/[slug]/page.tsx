import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BASE } from "../../data";
import { formatPeso, getProduct, products } from "../catalog";
import { BuyPanel } from "./buy";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found — Lumen Café" };
  return {
    title: `${product.name} — Lumen Café`,
    description: product.blurb,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const alsoIn = products
    .filter((other) => other.category === product.category && other.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-[90rem] px-5 pt-16 sm:px-10 sm:pt-24">
        <Link href={`${BASE}/shop`} className="lc-eyebrow inline-flex items-center gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Shop
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal kind="scale">
              <div
                className="relative aspect-square overflow-hidden border"
                style={{ borderColor: "var(--lc-line)" }}
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.imageAlt ?? product.name}
                    fill
                    preload
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    placeholder="blur"
                    className="object-cover"
                    style={product.stock === 0 ? { filter: "grayscale(1)" } : undefined}
                  />
                )}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <div className="lc-sticky">
              <p className="lc-eyebrow">{product.category}</p>
              <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.5rem)] leading-[0.95]">
                {product.name}
              </h1>
              <p
                className="mt-5 text-[17px] leading-relaxed"
                style={{ color: "var(--lc-fg-2)" }}
              >
                {product.blurb}
              </p>

              <div className="mt-8 border-t pt-8" style={{ borderColor: "var(--lc-line)" }}>
                <BuyPanel product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Description and facts */}
        <div
          className="mt-20 grid gap-12 border-t pt-16 lg:grid-cols-12 lg:gap-16"
          style={{ borderColor: "var(--lc-line)" }}
        >
          <div className="lg:col-span-7">
            <p className="lc-eyebrow">About it</p>
            <div className="mt-6 space-y-5">
              {product.description.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[17px] leading-relaxed"
                  style={{ color: "var(--lc-fg-2)" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {product.facts && (
            <div className="lg:col-span-5">
              <p className="lc-eyebrow">Details</p>
              <dl className="mt-6">
                {product.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-baseline justify-between gap-6 border-b py-3.5"
                    style={{ borderColor: "var(--lc-line)" }}
                  >
                    <dt className="text-[15px]" style={{ color: "var(--lc-fg-2)" }}>
                      {fact.label}
                    </dt>
                    <dd className="text-[15px]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* More in this category */}
        {alsoIn.length > 0 && (
          <section
            className="mt-20 border-t pt-16 pb-24"
            style={{ borderColor: "var(--lc-line)" }}
          >
            <p className="lc-eyebrow">More in {product.category.toLowerCase()}</p>
            <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {alsoIn.map((other) => (
                <li key={other.slug} className="lc-row group">
                  <Link href={`${BASE}/shop/${other.slug}`}>
                    <div
                      className="relative aspect-square overflow-hidden border"
                      style={{ borderColor: "var(--lc-line)" }}
                    >
                      {other.image && (
                        <Image
                          src={other.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 30vw, 45vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <h2 className="text-[1.15rem] leading-tight transition-colors group-hover:text-[var(--lc-accent-text)]">
                        {other.name}
                      </h2>
                      <span className="text-[14px] tabular-nums">
                        {formatPeso(other.price)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
