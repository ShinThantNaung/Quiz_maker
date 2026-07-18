// Prisma client singleton, connected to Turso (hosted libSQL) through the
// libSQL driver adapter.
//
// SQLite files can't persist on Vercel's serverless filesystem, so the app
// talks to Turso over the network. We use the *web* adapter (`/web`), a pure
// HTTP/fetch client with no native binary — the variant that bundles cleanly
// and runs on Vercel's serverless runtime.
//
//   Production (Vercel):  TURSO_DATABASE_URL (libsql://…) + TURSO_AUTH_TOKEN
//   Local development:    run `turso dev` and set TURSO_DATABASE_URL to the
//                         http://127.0.0.1:8080 URL it prints (no token), or
//                         point at a real Turso dev database.
//
// The singleton is cached on globalThis so Next.js hot reloads (dev) and reused
// serverless invocations don't open a new client each time. Server-only — never
// import from a "use client" module.

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Set it (and TURSO_AUTH_TOKEN for a hosted " +
        "Turso database) in your environment — see .env.example. For local " +
        "development, run `turso dev` and use the URL it prints.",
    );
  }
  const adapter = new PrismaLibSQL({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
