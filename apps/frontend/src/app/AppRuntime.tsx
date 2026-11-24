import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

const DeferredDevtools = lazy(async () => {
  const module = await import("@tanstack/react-query-devtools");

  return {
    default: module.ReactQueryDevtools,
  };
});

const DeferredPWAUpdatePrompt = lazy(async () => {
  const module = await import("@/components/pwa/PWAUpdatePrompt");

  return {
    default: module.PWAUpdatePrompt,
  };
});

const DeferredPWAInstallPrompt = lazy(async () => {
  const module = await import("@/components/pwa/PWAInstallPrompt");

  return {
    default: module.PWAInstallPrompt,
  };
});

const AppRuntime = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />

    <Toaster />

    <Suspense fallback={null}>
      {import.meta.env.DEV && <DeferredDevtools initialIsOpen={false} />}

      <DeferredPWAUpdatePrompt />
      <DeferredPWAInstallPrompt />
    </Suspense>
  </QueryClientProvider>
);

export default AppRuntime;
