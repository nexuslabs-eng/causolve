import react from "@vitejs/plugin-react";
import path from "node:path";
import { defaultExclude, defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: [...defaultExclude, "e2e/**"],
  },
});
