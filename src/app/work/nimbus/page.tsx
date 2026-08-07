import type { Metadata } from "next";
import { Cloud, GitBranch, Lock, Terminal, Zap } from "lucide-react";
import { DemoBar } from "@/components/demo-bar";
import { SERIF, type WpTheme } from "@/components/wp/theme";
import {
  LinkListWidget,
  SearchWidget,
  TagCloudWidget,
  Widget,
  WpBreadcrumbs,
  WpFooter,
  WpHeader,
  WpLayout,
  WpShell,
} from "@/components/wp/wp-chrome";
import { Pricing } from "./pricing";

export const metadata: Metadata = {
  title: "Nimbus — demo site",
  description:
    "A WordPress business-theme layout: services grid, pricing table plugin, FAQ accordion, widget sidebar.",
};

/** Corporate blue — the palette half of WordPress business themes ship with. */
const theme: WpTheme = {
  bg: "#eef2f7",
  surface: "#ffffff",
  surfaceAlt: "#e6edf5",
  ink: "#16212e",
  ink2: "#4a5a6b",
  line: "#cfdae6",
  accent: "#1c5cab",
  accentInk: "#ffffff",
  headerBg: "#ffffff",
  headerInk: "#16212e",
  footerBg: "#16212e",
  footerInk: "#dbe4ee",
  headingFont: SERIF,
};

/**
 * Nimbus is still a single page, so the nav points at anchors that genuinely
 * exist on it. Dropdowns and their own routes arrive when this demo is split
 * into pages, the way Lumen Café already is.
 */
const nav = [
  { label: "Home", href: "/work/nimbus" },
  { label: "Features", href: "#services" },
  { label: "One command", href: "#command" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  {
    icon: Zap,
    title: "Deploys in 8 seconds",
    body: "Incremental builds mean you ship the diff, not the whole tree. Median deploy across our users is under ten seconds.",
  },
  {
    icon: GitBranch,
    title: "A URL per branch",
    body: "Every push gets its own environment with its own database branch. Delete the branch, the environment goes with it.",
  },
  {
    icon: Terminal,
    title: "Local parity",
    body: "The same container runs on your laptop and in production. No more 'works on my machine' as a root cause.",
  },
  {
    icon: Lock,
    title: "Secrets that stay secret",
    body: "Encrypted at rest, injected at runtime, never written to the build log. Rotate without redeploying.",
  },
];

const faqs = [
  {
    q: "How is this different from just using a Dockerfile?",
    a: "It is not a replacement for one — Nimbus reads your Dockerfile if you have it. What it adds is the surrounding machinery: branch environments, secret injection, and build caching that survives across machines. If you already have that working, you probably do not need us.",
  },
  {
    q: "What happens when I hit the request limit?",
    a: "Nothing breaks. We keep serving traffic and email you at 80% and 100% of the plan limit. Overage is billed at $0.40 per 100k requests, and you can set a hard cap in the dashboard if you would rather have us start rate-limiting instead.",
  },
  {
    q: "Can I self-host?",
    a: "The runtime is open source and self-hostable under Apache 2.0. The control plane — dashboard, billing, team management — is not. Most teams who self-host run the runtime and skip the rest.",
  },
  {
    q: "How do I get my data out?",
    a: "One command: nimbus export --all. You get a tarball with your configuration as plain YAML and a Postgres dump. No support ticket, no waiting period, no exit interview.",
  },
];

export default function NimbusDemo() {
  return (
    <>
      <DemoBar name="Nimbus" slug="nimbus" />

      <WpShell theme={theme}>
        <WpHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Cloud className="size-6 text-[var(--wp-accent)]" aria-hidden />
              Nimbus
            </span>
          }
          tagline="Ship every branch to its own URL"
          nav={nav}
          active="/work/nimbus"
          titleHref="/work/nimbus"
          cta={
            <a
              href="#pricing"
              className="ml-2 bg-[var(--wp-accent)] px-4 py-2 text-[12.5px] font-semibold text-[var(--wp-accent-ink)]"
            >
              Start free
            </a>
          }
        />

        <WpBreadcrumbs
          trail={[{ label: "Home", href: "/work/nimbus" }, { label: "Platform" }]}
        />

        {/* Page banner — the theme's full-width hero widget */}
        <section className="border-b border-[var(--wp-line)] bg-[var(--wp-surface)]">
          <div className="mx-auto max-w-6xl px-5 py-14 text-center">
            <p className="text-[12px] font-bold tracking-[0.16em] text-[var(--wp-accent)] uppercase">
              Version 2.4 out now
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
              Ship every branch to its own URL
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--wp-ink-2)]">
              Nimbus builds your app on push, gives the branch a live environment with its own
              database, and tears it down when you merge. One config file, no YAML archaeology.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="#pricing"
                className="bg-[var(--wp-accent)] px-6 py-3 text-[13px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase"
              >
                Start free — no card
              </a>
              <a
                href="#services"
                className="border border-[var(--wp-line)] px-6 py-3 text-[13px] font-bold tracking-wide uppercase hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        <WpLayout
          sidebar={
            <>
              <SearchWidget title="Search Docs" />

              <Widget title="Get a Demo">
                <p>
                  Thirty minutes, screen shared, your repo. We will tell you honestly if Nimbus
                  is a bad fit.
                </p>
                <a
                  href="#"
                  className="mt-3 block bg-[var(--wp-accent)] px-4 py-2.5 text-center text-[12.5px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase"
                >
                  Book a call
                </a>
              </Widget>

              <Widget title="What Clients Say">
                <blockquote className="border-l-4 border-[var(--wp-accent)] pl-3 italic">
                  We deleted four hundred lines of CI config the week we moved. Nobody has
                  missed them.
                </blockquote>
                <p className="mt-2 text-[12.5px] font-semibold text-[var(--wp-ink)]">
                  — Platform lead, Northwind
                </p>
              </Widget>

              <LinkListWidget
                title="Documentation"
                items={[
                  "Quickstart",
                  "Branch databases",
                  "Secrets & env vars",
                  "CLI reference",
                ]}
              />

              <LinkListWidget
                title="Categories"
                items={[
                  { label: "Releases", count: 24 },
                  { label: "Engineering", count: 11 },
                  { label: "Guides", count: 9 },
                ]}
              />

              <TagCloudWidget
                tags={["ci", "docker", "postgres", "preview", "deploys", "secrets"]}
              />
            </>
          }
        >
          {/* Services grid */}
          <section
            id="services"
            /* scroll-mt clears the sticky header when an anchor is jumped to */
            className="scroll-mt-32 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8"
          >
            <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
              What You Get
            </h2>
            <div className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center bg-[var(--wp-surface-alt)] text-[var(--wp-accent)]">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold">{feature.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--wp-ink-2)]">
                      {feature.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Terminal sample, styled as a theme "code block" */}
          <section
            id="command"
            className="mt-8 scroll-mt-32 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8"
          >
            <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
              One Command
            </h2>
            <pre className="mt-5 overflow-x-auto border border-[var(--wp-line)] bg-[#16212e] p-5 font-mono text-[13px] leading-relaxed text-[#dbe4ee]">
              <code>
                <span className="text-[#7fd18f]">$</span> git push origin feat/checkout
                {"\n\n"}
                <span className="opacity-60">
                  {"→"} detected Next.js 16, reusing cache from main
                </span>
                {"\n"}
                <span className="opacity-60">{"→"} building… 6.2s</span>
                {"\n"}
                <span className="opacity-60">
                  {"→"} branching database nimbus-prod → feat-checkout
                </span>
                {"\n\n"}
                <span className="text-[#7fd18f]">{"✓"}</span> deployed in 8.4s
                {"\n  "}
                <span className="text-[#8ab6ea]">https://feat-checkout.acme.nimbus.app</span>
              </code>
            </pre>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="mt-8 scroll-mt-32 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8"
          >
            <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
              Pricing
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
              Every plan includes unlimited branch environments. You are billed for people, not
              for how often you deploy.
            </p>
            <div className="mt-7">
              <Pricing />
            </div>
          </section>

          {/* FAQ — native details, keyboard operable with zero JavaScript */}
          <section
            id="faq"
            className="mt-8 scroll-mt-32 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8"
          >
            <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="mt-5">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group border-b border-[var(--wp-line)] py-3.5 last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold">
                    {faq.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-lg text-[var(--wp-accent)] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 pr-8 text-[14px] leading-relaxed text-[var(--wp-ink-2)]">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </WpLayout>

        <WpFooter
          credit="Nimbus — a demo site built for a portfolio. Not a real product."
          columns={[
            {
              title: "Nimbus",
              body: (
                <p>
                  Branch environments, build caching, and secret management for teams who would
                  rather write the app than the pipeline.
                </p>
              ),
            },
            {
              title: "Product",
              body: (
                <ul className="space-y-1.5">
                  {["Deployments", "Branch databases", "Secrets", "Pricing"].map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:underline">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Resources",
              body: (
                <ul className="space-y-1.5">
                  {["Documentation", "Changelog", "Status", "Support"].map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:underline">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Newsletter",
              body: (
                <>
                  <p>Release notes, roughly monthly. No marketing.</p>
                  <div className="mt-3 flex">
                    <input
                      type="email"
                      aria-label="Email address"
                      placeholder="you@company.com"
                      className="min-w-0 flex-1 border border-current/25 bg-transparent px-3 py-2 text-[13px] outline-none"
                    />
                    <button
                      type="button"
                      className="shrink-0 bg-[var(--wp-accent)] px-3 py-2 text-[12.5px] font-semibold text-[var(--wp-accent-ink)]"
                    >
                      Join
                    </button>
                  </div>
                </>
              ),
            },
          ]}
        />
      </WpShell>
    </>
  );
}
