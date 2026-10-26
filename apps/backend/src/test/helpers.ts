import request from "supertest";
import type { Express } from "express";
import type { User } from "@causolve/database";
import { prismaMock } from "./mocks/prisma.js";

// Routes behind isAuthenticated need a real session cookie — there's no
// token to forge, it comes from the app's own session middleware. This
// drives the real /auth/login endpoint to get one, then hands back a
// supertest agent (which persists cookies across calls) so a test can
// reuse it to reach a protected route the same way a real client would.
export const loginAsFakeUser = async (
  app: Express,
  user: User,
  password: string,
): Promise<ReturnType<typeof request.agent>> => {
  const agent = request.agent(app);
  // loginUser and getSession request different Prisma select shapes off the
  // same findUnique call — since Prisma is fully mocked, this one fixture
  // has to satisfy both: loginUser's _count, and getSession's memberships.
  const mockedUser = {
    ...user,
    _count: { memberships: 0 },
    memberships: [],
  };
  prismaMock.user.findUnique.mockResolvedValue(mockedUser);

  const response = await agent.post("/auth/login").send({
    email: user.email,
    password,
  });

  if (response.status !== 200) {
    throw new Error(
      `loginAsFakeUser: login failed with status ${response.status}`,
    );
  }

  return agent;
};
