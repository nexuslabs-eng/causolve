import { Google } from "arctic";
import { env } from "./keys.js";

// Single shared Arctic client, same singleton pattern as prisma/logger/the
// email transporter — configured once from env, used by both the redirect
// step and the callback step of the flow.
export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);
