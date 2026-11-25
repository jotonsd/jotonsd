import type { NextConfig } from "next";

// Static export so the site can be hosted on GitHub Pages.
// BASE_PATH is set by the deploy workflow ("/repo-name", or "" for a <user>.github.io repo).
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
