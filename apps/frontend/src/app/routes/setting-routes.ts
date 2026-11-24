import { redirect, type RouteObject } from "react-router-dom";

export const personalRoutes: RouteObject[] = [
  {
    index: true,
    loader: () => redirect("/settings/profile"),
  },
  {
    path: "profile",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/personal-settings/ProfileSettings");
      return { Component: module.ProfileSettings };
    },
  },
  {
    path: "security",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/personal-settings/SecuritySettings");
      return { Component: module.SecuritySettings };
    },
  },
  {
    path: "notifications",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/personal-settings/NotificationsSettings");
      return { Component: module.NotificationsSettings };
    },
  },
  {
    path: "preferences",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/personal-settings/PreferencesSettings");
      return { Component: module.PreferencesSettings };
    },
  },
];

export const workspaceRoutes: RouteObject[] = [
  {
    index: true,
    loader: () => redirect("/workspace/settings/general"),
  },
  {
    path: "general",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/GeneralSettings");
      return { Component: module.GeneralSettings };
    },
  },
  {
    path: "members",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/MembersSettings");
      return { Component: module.MembersSettings };
    },
  },
  {
    path: "teams",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/TeamsSettings");
      return { Component: module.TeamsSettings };
    },
  },
  {
    path: "integrations",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/IntegrationsSettings");
      return { Component: module.IntegrationsSettings };
    },
  },
  {
    path: "investigation",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/InvestigationSettings");
      return { Component: module.InvestigationSettings };
    },
  },
  {
    path: "ai-evidence",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/AiEvidenceSettings");
      return { Component: module.AiEvidenceSettings };
    },
  },
  {
    path: "approvals",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/ApprovalSettings");
      return { Component: module.ApprovalSettings };
    },
  },
  {
    path: "audit",
    lazy: async () => {
      const module =
        await import("@/features/workspace/pages/workspace-settings/AuditSettings");
      return { Component: module.AuditSettings };
    },
  },
];
