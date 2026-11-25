import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, lazyPlugins } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),

    {
      name: "javascript-chunk-budget",
      apply: "build",
      enforce: "post",
      generateBundle(_, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type !== "chunk") continue;

          const sizeKB = Buffer.byteLength(output.code, "utf8") / 1000;

          if (sizeKB >= 1000) {
            this.error(
              `${output.fileName} is ${sizeKB.toFixed(1)} kB; ` +
                "JavaScript chunks must stay below 1000 kB.",
            );
          }
        }
      },
    },

    VitePWA({
      registerType: "prompt",

      includeAssets: [
        "favicon.svg",
        "icons/pwa-192x192.png",
        "icons/pwa-512x512.png",
        "icons/pwa-maskable-192x192.png",
        "icons/pwa-maskable-512x512.png",
      ],

      manifest: {
        id: "/",
        name: "Causolve",
        short_name: "Causolve",
        description:
          "Evidence-aware incident investigation and controlled remediation for engineering teams.",

        theme_color: "#090D14",
        background_color: "#090D14",

        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "image" || request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "causolve-static-assets",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ]),

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
