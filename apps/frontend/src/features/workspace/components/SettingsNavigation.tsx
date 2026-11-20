import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SettingsScope = "personal" | "workspace";

type SettingsItem = {
  label: string;
  path: string;
};

const personalItems: SettingsItem[] = [
  { label: "My profile", path: "/settings/profile" },
  { label: "Account & security", path: "/settings/security" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Preferences", path: "/settings/preferences" },
];

const workspaceItems: SettingsItem[] = [
  { label: "General", path: "/workspace/settings/general" },
  { label: "Members & roles", path: "/workspace/settings/members" },
  { label: "Teams", path: "/workspace/settings/teams" },
  { label: "Integrations", path: "/workspace/settings/integrations" },
  {
    label: "Investigation configuration",
    path: "/workspace/settings/investigation",
  },
  {
    label: "AI & evidence policies",
    path: "/workspace/settings/ai-evidence",
  },
  {
    label: "Approvals & remediation",
    path: "/workspace/settings/approvals",
  },
  { label: "Audit & activity", path: "/workspace/settings/audit" },
];

const itemsByScope: Record<SettingsScope, SettingsItem[]> = {
  personal: personalItems,
  workspace: workspaceItems,
};

export const SettingsNavigation = ({ scope }: { scope: SettingsScope }) => {
  const { pathname } = useLocation();
  const items = itemsByScope[scope];
  const title =
    scope === "workspace" ? "Workspace settings" : "Personal settings";

  return (
    <nav
      aria-label={title}
      className="border-b border-border pb-6 @[650px]:border-b-0 @[650px]:border-r @[650px]:pb-0 @[650px]:pr-6"
    >
      <p className="mb-3 font-mono text-[10px] uppercase text-primary-bright">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-9 items-center whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-foreground shadow-[inset_2px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
