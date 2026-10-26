import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://user:password@localhost:5432/resolve_os_test",
      CLIENT_URL: "http://localhost:5173",
      SESSION_SECRET: "test-session-secret-at-least-32-characters-long",
      LOG_LEVEL: "silent",
      SMTP_HOST: "smtp.test.local",
      SMTP_PORT: "2525",
      SMTP_USER: "test-user",
      SMTP_PASSWORD: "test-password",
      EMAIL_FROM: "Test <test@example.com>",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:4000/auth/google/callback",
      GITHUB_CLIENT_ID: "test-github-client-id",
      GITHUB_CLIENT_SECRET: "test-github-client-secret",
      GITHUB_REDIRECT_URI: "http://localhost:4000/auth/github/callback",
    },
  },
});
