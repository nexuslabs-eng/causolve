import { config } from 'dotenv';
import { z } from 'zod';

// load env files
if (process.env.NODE_ENV !== 'production') {
  config();
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default('info'),
  CLIENT_URL: z.url(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters.'),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_REDIRECT_URI: z.url(),
  OTP_EXPIRY_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
});

export const env = EnvSchema.parse(process.env);