import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/app/App";
import HomePage from "@/features/marketing/pages/HomePage";
import MarketingLayout from "@/layouts/MarketingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { AppLoading } from "@/components/loading/AppLoading";
import RouteErrorBoundary from "@/features/errors/pages/RouteErrorBoundary";
import { publicAuthRoutes, protectedOnboardingRoutes } from "@/app/router/auth";
import { PublicRoute } from "@/app/routes/PublicRoute";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { WorkspaceLayout } from "@/layouts/WorkspaceLayout";
import { WorkspaceOverview } from "@/features/workspace/pages/WorkspaceOverview";

const NotFound = lazy(() => import("@/features/errors/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/features/legal/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/features/legal/pages/TermsOfUse"));

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
            Component: MarketingLayout,
            children: [
              { index: true, Component: HomePage },
              { path: "privacy", Component: PrivacyPolicy },
              { path: "terms", Component: TermsOfUse },
            ],
          }
        ]
      },

      {
        Component: AuthLayout,
        children: [
          { Component: PublicRoute, children: publicAuthRoutes },
          { Component: ProtectedRoute, children: protectedOnboardingRoutes }
        ]
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: WorkspaceLayout,
            children: [{ path: "workspace", Component: WorkspaceOverview }],
          }
        ]
      },
      { path: "*", Component: NotFound }
    ],
  },
]);
