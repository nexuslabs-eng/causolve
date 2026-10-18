import react from "@vitejs/plugin-react";
import path from "node:path";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        }
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        exclude: [...defaultExclude, "e2e/**"],
    },
});