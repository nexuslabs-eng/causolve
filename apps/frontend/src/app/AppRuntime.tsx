import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

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

const PWAInstallPrompt = lazy(async () => {
  const module = await import("@/components/pwa/PWAInstallPrompt");

  return {
    default: module.PWAInstallPrompt,
  };
});

const AppRuntime = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster />

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
