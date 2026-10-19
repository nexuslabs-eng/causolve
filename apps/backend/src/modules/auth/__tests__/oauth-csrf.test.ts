import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../../app.js";

const EXPECTED_REDIRECT = "http://localhost:5173/login";

// Only the CSRF-guard branch is covered here — everything past it
// (validateAuthorizationCode, the userinfo fetch) talks to the real
// provider over the network and belongs behind a real OAuth flow, not a
// unit test. This is the one piece of the callback that's actually our
// own logic rather than a pass-through to `arctic`.
describe("GET /auth/google/callback", () => {
  it("rejects a state that doesn't match the one issued at sign-in", async () => {
    const agent = request.agent(app);
    await agent.get("/auth/google"); // seeds req.session.oauthState for real

    const response = await agent
      .get("/auth/google/callback")
      .query({ code: "some-code", state: "an-intentionally-wrong-state" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(EXPECTED_REDIRECT);

    const session = await agent.get("/auth/session");
    expect(session.body).toMatchObject({
      authenticated: false,
      oauthError: "OAUTH_AUTHENTICATION_FAILED",
    });
  });

  it("rejects a callback with no prior sign-in on the session", async () => {
    const agent = request.agent(app);

    const response = await agent
      .get("/auth/google/callback")
      .query({ code: "some-code", state: "any-state" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(EXPECTED_REDIRECT);

    const session = await agent.get("/auth/session");
    expect(session.body).toMatchObject({
      authenticated: false,
      oauthError: "OAUTH_AUTHENTICATION_FAILED",
    });
  });
});

describe("GET /auth/github/callback", () => {
  it("rejects a state that doesn't match the one issued at sign-in", async () => {
    const agent = request.agent(app);
    await agent.get("/auth/github"); // seeds req.session.oauthState for real

    const response = await agent
      .get("/auth/github/callback")
      .query({ code: "some-code", state: "an-intentionally-wrong-state" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(EXPECTED_REDIRECT);

    const session = await agent.get("/auth/session");
    expect(session.body).toMatchObject({
      authenticated: false,
      oauthError: "OAUTH_AUTHENTICATION_FAILED",
    });
  });

  it("rejects a callback with no prior sign-in on the session", async () => {
    const agent = request.agent(app);

    const response = await agent
      .get("/auth/github/callback")
      .query({ code: "some-code", state: "any-state" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(EXPECTED_REDIRECT);

    const session = await agent.get("/auth/session");
    expect(session.body).toMatchObject({
      authenticated: false,
      oauthError: "OAUTH_AUTHENTICATION_FAILED",
    });
  });
});
