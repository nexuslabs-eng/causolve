import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WORKSPACE_SETTINGS } from "@/features/workspace/lib/workspace-settings";

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

const workspaceItems: SettingsItem[] = WORKSPACE_SETTINGS.map((setting) => ({
  label: setting.label,
  path: `/workspace/settings/${setting.key}`,
}));

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
    <nav aria-label={title} className="h-fit min-w-0">
      <div className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-9 min-w-0 items-center rounded-md px-3 py-2 text-sm transition-colors",
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
