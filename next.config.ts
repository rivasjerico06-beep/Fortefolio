import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /**
       * Talkapo was renamed AnonChat once the whole account started expiring
       * rather than just what was posted from it. The old paths were public and
       * linked from the case study, so they forward permanently instead of
       * 404ing — including deep links, hence the wildcard.
       */
      { source: "/work/talkapo", destination: "/work/anonchat", permanent: true },
      { source: "/work/talkapo/:path*", destination: "/work/anonchat/:path*", permanent: true },
      { source: "/projects/talkapo", destination: "/projects/anonchat", permanent: true },
    ];
  },
};

export default nextConfig;
