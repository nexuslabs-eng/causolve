import { GitHub } from "arctic";
import { env } from "./keys.js";

// Same singleton pattern as googleOAuth.ts. Unlike Google, GitHub's OAuth2
// flow doesn't use PKCE — no code verifier involved.
export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  env.GITHUB_REDIRECT_URI,
);
