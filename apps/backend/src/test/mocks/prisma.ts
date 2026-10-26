import type { PrismaClient } from "@causolve/database";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";

// A fully mocked Prisma client, standing in for the real Postgres-backed
// one everywhere `@causolve/database` is imported. Keeps `Prisma` (used
// for `instanceof` checks in error.middleware.ts) and every other real
// export intact — only `prisma` itself is replaced.
export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

vi.mock("@causolve/database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@causolve/database")>();
  return {
    ...actual,
    prisma: prismaMock,
  };
});

beforeEach(() => {
  mockReset(prismaMock);
  // $transaction has two real overloads: an array of prisma promises, or an
  // interactive callback. Only the callback form is used anywhere so far
  // (acceptInvitation) — route it straight to prismaMock so `tx.x.y(...)`
  // inside the callback hits the same mocked methods as everywhere else.
  prismaMock.$transaction.mockImplementation((arg) =>
    typeof arg === "function" ? arg(prismaMock) : Promise.all(arg),
  );
});

beforeEach(() => {
  vi.clearAllMocks();
  mockReset(prismaMock);

  prismaMock.$transaction.mockImplementation((arg) =>
    typeof arg === "function" ? arg(prismaMock) : Promise.all(arg),
  );
});
