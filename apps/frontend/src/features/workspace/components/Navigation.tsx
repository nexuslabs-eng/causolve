import type { ComponentType } from "react";
import {
  Activity,
  Boxes,
  FileText,
  LayoutDashboard,
  Plug,
  ScanSearch,
  Settings,
  Siren,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  to?: string;
};

const primaryItems: NavigationItem[] = [
  { label: "Overview", icon: LayoutDashboard, active: true, to: "/workspace" },
  { label: "Incidents", icon: Siren },
  { label: "Investigations", icon: ScanSearch },
  { label: "Services", icon: Boxes },
  { label: "Postmortems", icon: FileText },
];

const operationsItems: NavigationItem[] = [
  { label: "Activity", icon: Activity },
  { label: "Integrations", icon: Plug },
];

const NavigationItemView = ({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavigationItem;
  collapsed: boolean;
  onNavigate: (() => void) | undefined;
}) => {
  const Icon = item.icon;

  const className = cn(
    "group flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
    item.active
      ? "bg-accent text-foreground shadow-[inset_2px_0_0_var(--primary)]"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
    collapsed && "justify-center px-0",
  );

  const content = (
    <>
      <Icon
        className={cn("size-4 shrink-0", item.active && "text-primary-bright")}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  );

  const control = item.to ? (
    <Link
      to={item.to}
      className={className}
      onClick={onNavigate}
      aria-current={item.active ? "page" : undefined}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      className={className}
      onClick={onNavigate}
      aria-current={item.active ? "page" : undefined}
    >
      {content}
    </button>
  );

  if (!collapsed) return control;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{control}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
};

const NavigationSection = ({
  label,
  items,
  collapsed,
  onNavigate,
}: {
  label?: string;
  items: NavigationItem[];
  collapsed: boolean;
  onNavigate: (() => void) | undefined;
}) => {
  return (
    <div>
      {label && !collapsed && (
        <p className="mb-2 px-2.5 font-mono text-[10px] font-medium uppercase text-muted-foreground">
          {label}
        </p>
      )}
      {label && collapsed && (
        <div className="mx-auto mb-2 h-px w-6 bg-border" />
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavigationItemView
            key={item.label}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export const Navigation = ({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: (() => void) | undefined;
}) => {
  const location = useLocation();
  const pathname = location.pathname;

  const items = primaryItems.map((item) => ({
    ...item,
    active: item.to === "/workspace" && pathname === "/workspace",
  }));
  return (
    <nav className="space-y-7" aria-label="Workspace navigation">
      <NavigationSection
        items={items}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
      <NavigationSection
        label="Operations"
        items={operationsItems}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    </nav>
  );
};

export const SettingsLink = ({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: (() => void) | undefined;
}) => {
  const location = useLocation();

  return (
    <NavigationSection
      label="Administration"
      items={[
        {
          label: "Settings",
          icon: Settings,
          to: "/settings/profile",
          active:
            location.pathname === "/settings" ||
            location.pathname.startsWith("/settings/"),
        },
      ]}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
  );
};
