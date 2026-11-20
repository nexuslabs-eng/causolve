import { lazy } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import App from "@/app/App";
import HomePage from "@/features/marketing/pages/HomePage";
import MarketingLayout from "@/layouts/MarketingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { AppLoading } from "@/components/loading/AppLoading";
import RouteErrorBoundary from "@/features/errors/pages/RouteErrorBoundary";
import { publicAuthRoutes, protectedOnboardingRoutes } from "@/app/router/auth";
import { PublicRoute } from "@/app/routes/PublicRoute";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { Overview } from "@/features/workspace/pages/Overview";
import { PersonalSettings } from "@/features/workspace/pages/PersonalSettings";
import { Settings } from "@/features/workspace/pages/Settings";
import { SecuritySettings } from "@/features/workspace/pages/SecuritySettings";
import { SettingsSection } from "@/features/workspace/pages/SettingsSection";
import { ProfileSettings } from "@/features/workspace/pages/ProfileSettings";
import { NotificationsSettings } from "@/features/workspace/pages/NotificationsSettings";
import { PreferencesSettings } from "@/features/workspace/pages/PreferencesSettings";

const NotFound = lazy(() => import("@/features/errors/pages/NotFound"));
const PrivacyPolicy = lazy(
  () => import("@/features/legal/pages/PrivacyPolicy"),
);
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
          },
        ],
      },

      {
        Component: AuthLayout,
        children: [
          { Component: PublicRoute, children: publicAuthRoutes },
          { Component: ProtectedRoute, children: protectedOnboardingRoutes },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: AppLayout,
            children: [
              { path: "workspace", Component: Overview },
              {
                path: "settings",
                Component: PersonalSettings,
                children: [
                  {
                    index: true,
                    loader: () => redirect("/settings/profile"),
                  },
                  { path: "profile", Component: ProfileSettings },
                  { path: "security", Component: SecuritySettings },
                  { path: "notifications", Component: NotificationsSettings },
                  { path: "preferences", Component: PreferencesSettings },
                ],
              },
              {
                path: "workspace/settings",
                Component: Settings,
                children: [
                  {
                    index: true,
                    loader: () => redirect("/workspace/settings/general"),
                  },
                  { path: "general", Component: SettingsSection },
                  { path: "members", Component: SettingsSection },
                  { path: "teams", Component: SettingsSection },
                  { path: "integrations", Component: SettingsSection },
                  { path: "investigation", Component: SettingsSection },
                  { path: "ai-evidence", Component: SettingsSection },
                  { path: "approvals", Component: SettingsSection },
                  { path: "audit", Component: SettingsSection },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
