import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  FileText,
  Gauge,
  Image as ImageIcon,
  MessageSquare,
  Paintbrush,
  Plug,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { DemoBar } from "@/components/demo-bar";
import { TrafficChart, RevenueChart, DataTable } from "./charts";

export const metadata: Metadata = {
  title: "Atlas Analytics — demo site",
  description:
    "A WordPress admin-panel layout: admin menu, metaboxes, and an analytics plugin screen.",
};

/**
 * wp-admin has its own fixed chrome, so this screen does not follow the
 * portfolio's light/dark toggle.
 *
 * `charts.tsx` reads --series-*, --line, --ink-*, --surface and --success from
 * the global theme. Those are re-declared here with the LIGHT steps of the
 * validated categorical palette; without this the charts would inherit
 * dark-mode steps and render low-contrast against the light admin panel.
 */
const adminVars: CSSProperties = {
  colorScheme: "light",
  "--bg": "#f0f0f1",
  "--surface": "#ffffff",
  "--surface-2": "#f0f0f1",
  "--ink": "#1d2327",
  "--ink-2": "#50575e",
  "--ink-3": "#646970",
  "--line": "#dcdcde",
  "--line-strong": "#a7aaad",
  "--series-1": "#2a78d6",
  "--series-2": "#eb6834",
  "--series-3": "#1baf7a",
  "--success": "#006300",
} as CSSProperties;

const stats = [
  { label: "Sessions", value: "43,700", delta: 18.2, note: "vs. previous month" },
  { label: "Signups", value: "1,284", delta: 9.4, note: "vs. previous month" },
  { label: "Conversion", value: "2.94%", delta: -0.3, note: "vs. previous month" },
  { label: "MRR", value: "$54.2k", delta: 11.1, note: "vs. previous month" },
];

const pages = [
  { path: "/", sessions: 18420, share: 42 },
  { path: "/pricing", sessions: 9130, share: 21 },
  { path: "/docs/quickstart", sessions: 6240, share: 14 },
  { path: "/blog/branch-databases", sessions: 4870, share: 11 },
  { path: "/changelog", sessions: 3110, share: 7 },
];

const adminMenu = [
  { icon: Gauge, label: "Dashboard" },
  { icon: FileText, label: "Posts" },
  { icon: ImageIcon, label: "Media" },
  { icon: FileText, label: "Pages" },
  { icon: MessageSquare, label: "Comments", badge: 3 },
  { icon: BarChart3, label: "Atlas Analytics", active: true },
  { icon: Paintbrush, label: "Appearance" },
  { icon: Plug, label: "Plugins", badge: 2 },
  { icon: Users, label: "Users" },
  { icon: Wrench, label: "Tools" },
  { icon: Settings, label: "Settings" },
];

const activity = [
  { time: "09:14", text: "Traffic report for February finished generating" },
  { time: "08:02", text: "Goal “Trial started” hit 100 conversions" },
  { time: "Yesterday", text: "Weekly digest emailed to 3 recipients" },
  { time: "Yesterday", text: "Referral source cluster updated" },
];

/** The bordered white panel every wp-admin screen is assembled from. */
function MetaBox({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#c3c4c7] px-3 py-2.5">
        <h2 className="text-[14px] font-semibold text-[#1d2327]">{title}</h2>
        {action && <span className="text-[12px] text-[#2271b1]">{action}</span>}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  );
}

export default function AtlasDemo() {
  return (
    <>
      <DemoBar name="Atlas Analytics" slug="atlas" />

      <div style={adminVars} className="flex-1 bg-[#f0f0f1] text-[#1d2327]">
        {/* Admin bar */}
        <div className="sticky top-11 z-40 flex h-8 items-center justify-between bg-[#1d2327] px-3 text-[13px] text-[#f0f0f1]">
          <div className="flex items-center gap-4">
            <span className="font-semibold">⌂ acme.nimbus.app</span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <MessageSquare className="size-3.5" aria-hidden /> 3
            </span>
            <span className="hidden sm:inline">+ New</span>
          </div>
          <span>Howdy, Jerico</span>
        </div>

        <div className="flex">
          {/* Admin menu — hidden on small screens, as wp-admin collapses it too.
              The dark column stretches the full document height (wp-admin does
              the same with #adminmenuback) while the list itself sticks. */}
          <div className="hidden w-40 shrink-0 bg-[#1d2327] lg:block">
            <nav
              aria-label="Admin menu"
              className="sticky top-[4.75rem] max-h-[calc(100vh-4.75rem)] overflow-y-auto py-1 text-[13px] text-[#c3c4c7]"
            >
              {adminMenu.map((item) => (
                <span
                  key={item.label}
                  className={`flex cursor-default items-center gap-2 px-3 py-2 ${
                    item.active
                      ? "bg-[#2271b1] font-semibold text-white"
                      : "hover:bg-[#2c3338] hover:text-white"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-[#d63638] px-1.5 text-[11px] text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Screen content */}
          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[23px] font-normal text-[#1d2327]">Atlas Analytics</h1>
              <div className="flex flex-wrap gap-1.5">
                {["Last 7 days", "Last 30 days", "Last 12 months"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`border px-2.5 py-1 text-[13px] ${
                      range === "Last 12 months"
                        ? "border-[#2271b1] bg-[#2271b1] text-white"
                        : "border-[#c3c4c7] bg-white text-[#2271b1] hover:border-[#2271b1]"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[#646970]">
              acme.nimbus.app · 1 Aug – 31 Aug 2026
            </p>

            {/* At a Glance */}
            <div className="mt-5">
              <MetaBox title="At a Glance">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => {
                    const up = stat.delta >= 0;
                    const Icon = up ? ArrowUpRight : ArrowDownRight;
                    return (
                      <div key={stat.label} className="border-l-4 border-[#2271b1] pl-3">
                        <dt className="text-[13px] text-[#646970]">{stat.label}</dt>
                        <dd className="mt-0.5 text-[26px] leading-tight font-semibold">
                          {stat.value}
                        </dd>
                        <p className="mt-0.5 flex items-center gap-1 text-[12px]">
                          {/* Icon + sign, so direction never rests on colour alone */}
                          <Icon
                            className="size-3.5"
                            style={{ color: up ? "#006300" : "#d63638" }}
                            aria-hidden
                          />
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: up ? "#006300" : "#d63638" }}
                          >
                            {up ? "+" : ""}
                            {stat.delta}%
                          </span>
                          <span className="text-[#646970]">{stat.note}</span>
                        </p>
                      </div>
                    );
                  })}
                </dl>
              </MetaBox>
            </div>

            {/* Charts — two measures on different scales get two charts, never two axes */}
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {/* Box titles stay distinct from the charts' own headings, so the
                  same words are not stacked twice */}
              <MetaBox title="Traffic">
                <TrafficChart />
              </MetaBox>
              <MetaBox title="Revenue">
                <RevenueChart />
              </MetaBox>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <MetaBox title="Top Pages" action="View all">
                <ul className="space-y-3.5">
                  {pages.map((page) => (
                    <li key={page.path}>
                      <div className="flex items-baseline justify-between gap-4 text-[13px]">
                        <span className="truncate text-[#2271b1]">{page.path}</span>
                        <span className="shrink-0 text-[#646970] tabular-nums">
                          {page.sessions.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden bg-[#f0f0f1]">
                        <div
                          className="h-full bg-[#2a78d6]"
                          style={{ width: `${page.share}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </MetaBox>

              <MetaBox title="All Data">
                <p className="mb-3 text-[13px] text-[#646970]">
                  Every chart above has a readable table, so nothing depends on seeing colour.
                </p>
                <DataTable />
              </MetaBox>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <MetaBox title="Activity">
                <ul className="divide-y divide-[#f0f0f1]">
                  {activity.map((entry) => (
                    <li key={entry.text} className="flex gap-3 py-2.5 text-[13px]">
                      <span className="w-20 shrink-0 text-[#646970]">{entry.time}</span>
                      <span>{entry.text}</span>
                    </li>
                  ))}
                </ul>
              </MetaBox>

              <MetaBox title="Quick Draft">
                <label htmlFor="qd-title" className="block text-[13px] font-medium">
                  Title
                </label>
                <input
                  id="qd-title"
                  type="text"
                  className="mt-1 w-full border border-[#8c8f94] px-2.5 py-1.5 text-[14px] outline-none focus:border-[#2271b1]"
                />
                <label htmlFor="qd-body" className="mt-3 block text-[13px] font-medium">
                  Content
                </label>
                <textarea
                  id="qd-body"
                  rows={3}
                  placeholder="What's on your mind?"
                  className="mt-1 w-full border border-[#8c8f94] px-2.5 py-1.5 text-[14px] outline-none focus:border-[#2271b1]"
                />
                <button
                  type="button"
                  className="mt-3 bg-[#2271b1] px-3 py-1.5 text-[13px] font-medium text-white"
                >
                  Save Draft
                </button>
              </MetaBox>
            </div>

            <p className="mt-8 border-t border-[#c3c4c7] pt-4 text-[13px] text-[#646970]">
              Thank you for creating with{" "}
              <span className="text-[#2271b1]">a demo built for a portfolio</span>. Version
              6.4.3
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
