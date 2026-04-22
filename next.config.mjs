/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        destination: "/_next/static/css/0e397ceefc10bfb4.css",
        source: "/_next/static/css/4b28c42dc54c297.css",
      },
      {
        destination: "/_next/static/chunks/app/page-9a44de3854a6c9ee.js",
        source: "/_next/static/chunks/app/page-e18f5ba08bc78442.js",
      },
    ];
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
        source: "/",
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
