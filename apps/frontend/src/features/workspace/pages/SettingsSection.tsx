import { useLocation } from "react-router-dom";

const sectionDetails: Record<string, { title: string; description: string }> = {
  profile: {
    title: "My profile",
    description: "Manage your personal profile information.",
  },
  notifications: {
    title: "Notifications",
    description: "Configure how Causolve delivers personal notifications.",
  },
  preferences: {
    title: "Preferences",
    description: "Manage your personal application preferences.",
  },
  general: {
    title: "General",
    description: "Manage the basic configuration for this workspace.",
  },
  members: {
    title: "Members & roles",
    description: "Manage workspace membership, invitations, and roles.",
  },
  teams: {
    title: "Teams",
    description: "Manage workspace teams and team membership.",
  },
  integrations: {
    title: "Integrations",
    description: "Manage the tools connected to this workspace.",
  },
  investigation: {
    title: "Investigation configuration",
    description: "Configure workspace investigation defaults.",
  },
  "ai-evidence": {
    title: "AI & evidence policies",
    description: "Configure AI boundaries and evidence handling policies.",
  },
  approvals: {
    title: "Approvals & remediation",
    description: "Configure authorization requirements for high-impact actions.",
  },
  audit: {
    title: "Audit & activity",
    description: "Review administrative and workspace activity.",
  },
};

export const SettingsSection = () => {
  const { pathname } = useLocation();
  const section = pathname.split("/").filter(Boolean).at(-1) ?? "general";
  const details = sectionDetails[section] ?? sectionDetails.general;

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase text-primary-bright">
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {details.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {details.description}
        </p>
      </header>

      <div className="py-8">
        <p className="text-sm text-muted-foreground">
          This settings section is not available yet.
        </p>
      </div>
    </div>
  );
};
