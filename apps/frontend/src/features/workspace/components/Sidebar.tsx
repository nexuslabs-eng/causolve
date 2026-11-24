import {
  ChevronsLeft,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SignOutDialog } from "@/components/dialog/sign-out-dialog";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";
import {
  Navigation,
  SettingsLink,
} from "@/features/workspace/components/Navigation";

const Switcher = ({
  collapsed,
  mobile,
  menuContainer,
}: {
  collapsed: boolean;
  mobile: boolean;
  menuContainer?: React.RefObject<HTMLElement | null>;
}) => {
  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  const workspaceName = session?.authenticated
    ? (session.activeWorkspace?.name ?? "Causolve workspace")
    : "Causolve workspace";

  const workspaceInitials = workspaceName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu modal={!mobile}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full justify-start px-2 py-2 text-left",
            collapsed && "justify-center px-0",
          )}
          aria-label="Switch workspace"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised font-mono text-[10px] font-semibold text-primary-bright">
            {workspaceInitials}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {workspaceName}
                </span>
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        container={menuContainer}
        className="w-60"
      >
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => navigate("/workspace/settings/general")}
        >
          Workspace settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserMenu = ({
  collapsed,
  mobile,
  menuContainer,
}: {
  collapsed: boolean;
  mobile: boolean;
  menuContainer?: React.RefObject<HTMLElement | null>;
}) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { data: session } = useAuthSession();
  const logout = useLogout("/");
  const userName = session?.authenticated
    ? session.user.fullName
    : "Causolve user";
  const userEmail = session?.authenticated ? session.user.email : "";

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <DropdownMenu modal={!mobile}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto w-full justify-start px-2 py-2 text-left",
              collapsed && "justify-center px-0",
            )}
            aria-label="Open user menu"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {initials}
            </span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {userName}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {userEmail}
                  </span>
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side={collapsed ? "right" : "top"}
          container={menuContainer}
          className="w-52"
        >
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserRound />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SlidersHorizontal />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        loading={logout.isPending}
        onConfirm={() => {
          logout.mutate();
        }}
      />
    </>
  );
};

export const Sidebar = ({
  collapsed,
  onToggle,
  mobile = false,
  onNavigate,
  menuContainer,
}: {
  collapsed: boolean;
  onToggle?: (() => void) | undefined;
  mobile?: boolean;
  onNavigate?: (() => void) | undefined;
  menuContainer?: React.RefObject<HTMLElement | null>;
}) => {
  const compact = mobile ? false : collapsed;

  return (
    <aside
      className="flex h-full min-h-0 flex-col bg-surface-inset"
      aria-label="Workspace sidebar"
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border px-3",
          compact ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <ResolutionNode
            className="h-6 shrink-0 text-primary-bright"
            title="Causolve"
          />
          {!compact && (
            <span className="truncate text-sm font-semibold text-foreground">
              Causolve
            </span>
          )}
        </div>

        {!mobile && onToggle && !compact && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onToggle}
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="shrink-0 border-b border-border p-2.5">
        <Switcher
          collapsed={compact}
          mobile={mobile}
          menuContainer={menuContainer}
        />
      </div>

      <div className="min-h-0 flex-1 px-2.5 py-4 overflow-y-auto scrollbar-thin">
        <Navigation collapsed={compact} onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 space-y-3 border-t border-border p-2.5">
        <SettingsLink collapsed={compact} onNavigate={onNavigate} />
        <UserMenu
          collapsed={compact}
          mobile={mobile}
          menuContainer={menuContainer}
        />
      </div>
    </aside>
  );
};
