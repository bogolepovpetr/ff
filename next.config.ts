import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/:lang/vip", destination: "/:lang/deals/vip", permanent: true },
      { source: "/:lang/vip/:path*", destination: "/:lang/deals/vip/:path*", permanent: true },
      { source: "/:lang/dawn-fund", destination: "/:lang/deals/dawn-fund", permanent: true },
      { source: "/:lang/fomopass", destination: "/:lang/deals", permanent: true },
      { source: "/:lang/fomopass/:path*", destination: "/:lang/deals", permanent: true },
    ];
  },
};

export default nextConfig;
