import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["userpic.redgifs.com", "www.save-free.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "userpic.redgifs.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.save-free.com",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.redgifs.com/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
