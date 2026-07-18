// Prisma client singleton.
//
// Next.js hot-reloads modules in dev, which would otherwise spawn a new
// PrismaClient (and connection pool) on every change. Caching it on globalThis
// keeps a single instance across reloads. Server-only — never import from a
// "use client" module.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
