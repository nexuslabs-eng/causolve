import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { queryClient } from "@/lib/query-client";

import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

const ReactQueryDevtools = lazy(async () => {
  const module = await import("@tanstack/react-query-devtools");

  return {
    default: module.ReactQueryDevtools,
  };
});

const PWAUpdatePrompt = lazy(async () => {
  const module = await import("@/components/pwa/PWAUpdatePrompt");

  return {
    default: module.PWAUpdatePrompt,
  };
});

const Toaster = lazy(async () => {
  const module = await import("@/components/ui/sonner");

  return { default: module.Toaster };
});

const AppRuntime = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Suspense fallback={null}>
        <Toaster />
      </Suspense>

      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <PWAUpdatePrompt />
        <PWAInstallPrompt />
      </Suspense>
    </QueryClientProvider>
  );
};

export default AppRuntime;
