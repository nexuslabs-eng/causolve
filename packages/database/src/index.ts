import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const isDev = process.env.NODE_ENV === "development";

export const prisma = new PrismaClient({
  adapter,
  log: isDev
    ? ([
        { emit: "event", level: "query" },
        { emit: "stdout", level: "error" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
      ] as const)
    : ([{ emit: "stdout", level: "error" }] as const),
});

export * from "./generated/prisma/index.js";
