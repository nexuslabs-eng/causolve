import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { scheduleIdle } from "@/app/utils";

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

const AppRuntime = () => {
  const [loadDeferredFeatures, setLoadDeferredFeatures] = useState(false);

  useEffect(() => {
    return scheduleIdle(() => {
      setLoadDeferredFeatures(true);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster />

      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <DeferredDevtools initialIsOpen={false} />
        </Suspense>
      )}

      {loadDeferredFeatures && (
        <Suspense fallback={null}>
          <DeferredPWAUpdatePrompt />
          <DeferredPWAInstallPrompt />
        </Suspense>
      )}
    </QueryClientProvider>
  );
};

export default AppRuntime;
