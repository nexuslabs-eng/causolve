import { lazy } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import App from "@/app/App";
import { AppLoading } from "@/components/loading/AppLoading";
import RouteErrorBoundary from "@/features/errors/pages/RouteErrorBoundary";
import { publicAuthRoutes, protectedOnboardingRoutes } from "@/app/router/auth";
import { PublicRoute } from "@/app/routes/PublicRoute";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { onboardingRoutes } from "@/app/routes/constants";
import { authSessionQueryOptions } from "@/features/auth/queries/auth-session-query-options";
import { queryClient } from "@/lib/query-client";

import { personalRoutes, workspaceRoutes } from "@/app/routes/setting-routes";

const landingLoader = async () => {
  try {
    const session = await queryClient.ensureQueryData(authSessionQueryOptions());

    if (!session.authenticated) {
      return null;
    }

    if (session.onboarding.status === "COMPLETED") {
      return redirect("/workspace");
    }

    return redirect(onboardingRoutes[session.onboarding.nextStep]);
  } catch {
    return null;
  }
};

export const router = createBrowserRouter([
  {
    id: "root",
    HydrateFallback: AppLoading,
    ErrorBoundary: RouteErrorBoundary,
    Component: App,
    children: [
      {
        Component: PublicRoute,
        children: [
          {
            lazy: async () => {
              const module = await import("@/layouts/MarketingLayout");
              return { Component: module.default };
            },
            children: [
              {
                index: true,
                loader: landingLoader,
                lazy: async () => {
                  const module = await import("@/features/marketing/pages/HomePage");
                  return { Component: module.default };
                },
              },
              {
                path: "privacy",
                Component: lazy(() => import("@/features/legal/pages/PrivacyPolicy")),
              },
              {
                path: "terms",
                Component: lazy(() => import("@/features/legal/pages/TermsOfUse")),
              },
            ],
          },
        ],
      },

      {
        lazy: async () => {
          const module = await import("@/layouts/AuthLayout");
          return { Component: module.default };
        },
        children: [
          { Component: PublicRoute, children: publicAuthRoutes },
          { Component: ProtectedRoute, children: protectedOnboardingRoutes },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            lazy: async () => {
              const module = await import("@/layouts/AppLayout");
              return { Component: module.AppLayout };
            },
            children: [
              {
                path: "workspace",
                lazy: async () => {
                  const module = await import("@/features/workspace/pages/Overview");
                  return { Component: module.Overview };
                },
              },
              {
                path: "settings",
                lazy: async () => {
                  const module = await import("@/features/workspace/pages/PersonalSettings");
                  return { Component: module.PersonalSettings };
                },
                children: personalRoutes,
              },
              {
                path: "workspace/settings",
                lazy: async () => {
                  const module = await import("@/features/workspace/pages/WorkspaceSettings");
                  return { Component: module.WorkspaceSettings };
                },
                children: workspaceRoutes,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        Component: lazy(() => import("@/features/errors/pages/NotFound")),
      },
    ],
  },
]);
