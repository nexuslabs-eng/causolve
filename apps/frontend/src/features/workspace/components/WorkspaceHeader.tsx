import { Bell, BookOpen, ChevronsRight, Menu, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignOutDialog } from "@/components/dialog/sign-out-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface WorkspaceHeaderProps {
  onOpenNavigation: () => void;
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export const WorkspaceHeader = ({ onOpenNavigation, collapsed, onToggleSidebar }: WorkspaceHeaderProps) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { data: session } = useAuthSession();
  const logout = useLogout("/");
  const userName = session?.authenticated ? session.user.fullName : "Causolve user";
  
  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  
    const workspaceName = session?.authenticated
    ? session.activeWorkspace?.name ?? "Causolve workspace"
    : "Causolve workspace";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenNavigation} aria-label="Open navigation">
        <Menu />
      </Button>

      {collapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="hidden size-6 md:inline-flex"
              onClick={onToggleSidebar}
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Expand sidebar</TooltipContent>
        </Tooltip>
      )}

      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="hidden text-muted-foreground sm:inline">{workspaceName}</span>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <span className="truncate font-medium text-foreground">Overview</span>
        <span className="ml-1 hidden border-l border-border pl-3 font-mono text-[10px] uppercase text-muted-foreground lg:inline">Production</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="hidden h-8 w-64 items-center gap-2 rounded-md border border-input bg-surface px-2.5 text-left text-xs text-muted-foreground outline-none transition-colors hover:border-border-strong hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring lg:flex"
          aria-label="Search incidents and services"
        >
          <Search className="size-3.5" />
          <span className="flex-1">Search incidents, services...</span>
          <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search"><Search /></Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Button variant="brand" size="sm" className="hidden sm:inline-flex">
          <Plus />Create incident
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="brand" size="icon" className="sm:hidden" aria-label="Create incident"><Plus /></Button>
          </TooltipTrigger>
          <TooltipContent>Create incident</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button></TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Help and documentation"><BookOpen /></Button></TooltipTrigger>
          <TooltipContent>Help and documentation</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-0.5 rounded-full" aria-label="Open user menu">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">{initials}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SignOutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        loading={logout.isPending}
        onConfirm={async () => {
          try {
            await logout.mutateAsync();
            setLogoutDialogOpen(false);
          } catch {
            // Keep the dialog open so the user can retry.
          }
        }}
      />
    </header>
  );
}
