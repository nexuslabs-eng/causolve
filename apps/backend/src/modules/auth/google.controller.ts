import type { Request, Response } from "express";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import { generateCodeVerifier, generateState } from "arctic";
import { google } from "../../infrastructure/googleOAuth.js";
import { env } from "../../infrastructure/keys.js";
import { prisma } from "@resolve-os/database";

export const googleSignIn = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);
    req.session.oauthState = state;
    req.session.oauthCodeVerifier = codeVerifier;

    res.redirect(url.toString());
  },
);

export const googleCallBack = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const code = req.query.code;
    const state = req.query.state;
    const storedState = req.session.oauthState;
    const storedCodeVerifier = req.session.oauthCodeVerifier;

    delete req.session.oauthState;
    delete req.session.oauthCodeVerifier;

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      !storedState ||
      !storedCodeVerifier ||
      state !== storedState
    ) {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }
    let tokens;
    try {
      tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    } catch {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }
    const userInfoResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${tokens.accessToken()}` } },
    );
    const googleUser = (await userInfoResponse.json()) as {
      email: string;
      email_verified: boolean;
      name: string;
    };
    if (!googleUser.email_verified) {
      req.session.oauthError = "OAUTH_AUTHENTICATION_FAILED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    if (existingUser && existingUser.authProvider !== "GOOGLE") {
      req.session.oauthError = "EMAIL_ALREADY_REGISTERED";
      res.redirect(`${env.CLIENT_URL}/login`);
      return;
    }

    const user =
      existingUser ??
      (await prisma.user.create({
        data: {
          fullName: googleUser.name,
          email: googleUser.email,
          authProvider: "GOOGLE",
          emailVerified: true,
        },
      }));

    req.session.userId = user.id;

    res.redirect(env.CLIENT_URL);
  },
);
