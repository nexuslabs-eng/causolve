import type { Request, Response } from "express";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import { generateState } from "arctic";
import { github } from "../../infrastructure/githubOAuth.js";
import { env } from "../../infrastructure/keys.js";
import { prisma } from "@resolve-os/database";

export const githubSignIn = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const state = generateState();

    const url = github.createAuthorizationURL(state, [
      "read:user",
      "user:email",
    ]);

    req.session.oauthState = state;

    res.redirect(url.toString());
  },
);

export const githubCallBack = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const code = req.query.code;
    const state = req.query.state;
    const storedState = req.session.oauthState;

    delete req.session.oauthState;

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      !storedState ||
      state !== storedState
    ) {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }
    let tokens;
    try {
      tokens = await github.validateAuthorizationCode(code);
    } catch {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const githubUser = (await userResponse.json()) as {
      name: string | null;
      login: string;
    };
    // /user's own `email` field can be null if the person has made their
    // email private — a real, common case. The only reliable way to get a
    // usable address is this separate endpoint, then pick the one GitHub
    // itself marks as both primary and verified.

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    const emails = (await emailsResponse.json()) as {
      email: string;
      primary: boolean;
      verified: boolean;
    }[];
    const primaryVerifiedEmail = emails.find((e) => e.primary && e.verified);

    if (!primaryVerifiedEmail) {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: primaryVerifiedEmail.email },
    });

    if (existingUser && existingUser.authProvider !== "GITHUB") {
      req.session.oauthError = "EMAIL_ALREADY_REGISTERED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }
    const user =
      existingUser ??
      (await prisma.user.create({
        data: {
          fullName: githubUser.name ?? githubUser.login,
          email: primaryVerifiedEmail.email,
          authProvider: "GITHUB",
          emailVerified: true,
        },
      }));

    req.session.userId = user.id;

    res.redirect(env.CLIENT_URL);
  },
);
