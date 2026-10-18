import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:5173",
    serviceWorkers: "block",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "pnpm exec vite --host localhost",
      cwd: ".",
      url: "http://localhost:5173/src/app/AppRuntime.tsx",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_ENABLE_MSW: "false",
      }
    },
    {
      command:
        "pnpm --filter @resolve-os/backend e2e:prepare && pnpm --filter @resolve-os/backend dev:e2e",
      cwd: "../..",
      url: "http://localhost:5000/health",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @resolve-os/backend mailpit",
      url: "http://127.0.0.1:8025/api/v1/messages",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
