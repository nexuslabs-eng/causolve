import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router/router";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";
import { queryClient } from "@/lib/query-client";

const AppRuntime = () => (
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} />
        )}

        <PWAUpdatePrompt />
        <PWAInstallPrompt />
    </QueryClientProvider>
);

export default AppRuntime;