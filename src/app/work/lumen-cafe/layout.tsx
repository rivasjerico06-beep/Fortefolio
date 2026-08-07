import { DemoBar } from "@/components/demo-bar";
import { WpFooter, WpShell } from "@/components/wp/wp-chrome";
import { BASE, hours, posts, theme, address } from "./data";

/**
 * Chrome shared by every Lumen page: the portfolio's demo bar, the themed
 * shell, and the footer widgets.
 *
 * The site header deliberately lives in each page rather than here. A server
 * layout cannot know which child route is active, so putting the header in it
 * would force `usePathname` and turn the header into a client component — and
 * this header is currently zero-JavaScript (CSS dropdowns, a native <details>
 * mobile menu). Each page passing its own `active` href keeps that intact.
 */
export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBar name="Lumen Café" slug="lumen-cafe" />

      <WpShell theme={theme}>
        {children}

        <WpFooter
          credit="Lumen Café — a demo site built for a portfolio. Not a real business."
          columns={[
            {
              title: "About",
              body: (
                <p>
                  A twelve-seat coffee bar in Poblacion, roasting eight kilometres away and open
                  from seven every day.
                </p>
              ),
            },
            {
              title: "Opening Hours",
              body: (
                <ul className="space-y-1">
                  {hours.map((entry) => (
                    <li key={entry.day} className="flex justify-between gap-3">
                      <span>{entry.day}</span>
                      <span className="tabular-nums">{entry.time}</span>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Recent Posts",
              body: (
                <ul className="space-y-2">
                  {posts.slice(0, 3).map((post) => (
                    <li key={post.slug}>
                      <a href={`${BASE}/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Contact",
              body: (
                <address className="space-y-1 not-italic">
                  <p>{address.street}</p>
                  <p>{address.area}</p>
                  <p>{address.postcode}</p>
                  <p>
                    <a
                      href={`tel:${address.phone.replace(/\s/g, "")}`}
                      className="hover:underline"
                    >
                      {address.phone}
                    </a>
                  </p>
                </address>
              ),
            },
          ]}
        />
      </WpShell>
    </>
  );
}
