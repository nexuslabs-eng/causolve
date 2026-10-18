import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useThemeStore } from "@/stores/use-theme-store";
import { enableMocking } from '@/mocks/enable-mocking';
import '@/styles/index.css';
import { AppLoading } from '@/components/loading/AppLoading';
import { queryClient } from '@/lib/query-client';
import { authSessionQueryOptions } from '@/features/auth/queries/auth-session-query-options';

const preloadInitialAuthRoutes = () => {
  void import("@/features/auth/pages/Login");
  void import("@/features/auth/pages/signup/Account");
}

useThemeStore.getState().initializeTheme();

const container = document.getElementById("root");

if (!container)
  throw new Error("ResolveOS root element was not found.")

const root = createRoot(container);

root.render(
  <StrictMode>
    <AppLoading />
  </StrictMode>
)

const startApplication = async () => {
  try {
    await enableMocking();

    preloadInitialAuthRoutes();
    
    const runtimePromise = import("@/app/AppRuntime");
    
    const sessionPromise = queryClient.query({
      ...authSessionQueryOptions(),
      staleTime: 30_000
    });

    const [{ default: AppRuntime }] = await Promise.all([ runtimePromise, sessionPromise ]);

    root.render(
      <StrictMode>
        <AppRuntime />
      </StrictMode>
    );
  } catch (error) {
    console.error(`ResolveOS startup failed: ${error}`);

    root.render(
      <StrictMode>
        <AppLoading
          failed
          onRetry={() => window.location.reload()}
        />
      </StrictMode>
    );
  }
};

void startApplication();