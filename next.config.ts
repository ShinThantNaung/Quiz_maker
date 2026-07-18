import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the libSQL/Prisma adapter out of the webpack bundle; it's loaded from
  // node_modules at runtime on the server (route handlers / server components).
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client"],
};

export default nextConfig;
