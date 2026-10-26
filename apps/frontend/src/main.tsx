import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useThemeStore } from "@/stores/use-theme-store";
import { enableMocking } from '@/mocks/enable-mocking';
import '@/styles/index.css';
import { AppLoading } from '@/components/loading/AppLoading';

const preloadInitialAuthRoutes = () => {
  void import("@/features/auth/pages/Login");
  void import("@/features/auth/pages/signup/Account");
}

useThemeStore.getState().initializeTheme();

const container = document.getElementById("root");

if (!container)
  throw new Error("Causolve root element was not found.")

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
    
    const { default: AppRuntime } = await runtimePromise;

    root.render(
      <StrictMode>
        <AppRuntime />
      </StrictMode>
    );
  } catch (error) {
    console.error(`Causolve startup failed: ${error}`);

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