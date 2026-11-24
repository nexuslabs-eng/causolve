export const WORKSPACE_SETTINGS = [
  {
    key: "general",
    label: "General",
    title: "General",
    description: "Manage the basic configuration for this workspace.",
  },
  {
    key: "members",
    label: "Members & roles",
    title: "Members & roles",
    description: "Manage workspace membership, invitations, and roles.",
  },
  {
    key: "teams",
    label: "Teams",
    title: "Teams",
    description: "Manage workspace teams and team membership.",
  },
  {
    key: "integrations",
    label: "Integrations",
    title: "Integrations",
    description: "Manage the tools connected to this workspace.",
  },
  {
    key: "investigation",
    label: "Investigation configuration",
    title: "Investigation configuration",
    description: "Configure workspace investigation defaults.",
  },
  {
    key: "ai-evidence",
    label: "AI & evidence policies",
    title: "AI & evidence policies",
    description: "Configure AI boundaries and evidence handling policies.",
  },
  {
    key: "approvals",
    label: "Approvals & remediation",
    title: "Approvals & remediation",
    description: "Configure authorization requirements for high-impact actions.",
  },
  {
    key: "audit",
    label: "Audit & activity",
    title: "Audit & activity",
    description: "Configure audit retention, access, event coverage, and archival.",
  },
] as const;

export type WorkspaceSettingKey = (typeof WORKSPACE_SETTINGS)[number]["key"];

export const getWorkspaceSetting = (key: string) =>
  WORKSPACE_SETTINGS.find((setting) => setting.key === key) ?? WORKSPACE_SETTINGS[0];
