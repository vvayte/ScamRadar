import path from "path";
import { PrismaClient } from "@prisma/client";

// On Windows, relative SQLite paths break inside Next.js API routes.
// Resolve to an absolute path before PrismaClient is instantiated.
const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
if (rawUrl.startsWith("file:./") || rawUrl.startsWith("file:../")) {
  const relative = rawUrl.replace(/^file:/, "");
  const absolute = path.resolve(process.cwd(), relative);
  process.env.DATABASE_URL = `file:${absolute}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const db = globalForPrisma.prisma ?? new PrismaClient({ log: [] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
