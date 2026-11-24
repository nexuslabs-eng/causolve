import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/features/workspace/components/Header";
import { Sidebar } from "@/features/workspace/components/Sidebar";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "causolve-sidebar-collapsed";

const getInitialCollapsedState = () => {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
};

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      collapsed ? "true" : "false",
    );
  }, [collapsed]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed inset-0 flex min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
        <div
          className={`relative hidden h-full shrink-0 border-r border-border transition-[width] duration-200 md:block ${collapsed ? "w-18" : "w-62"}`}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            ref={mobileSheetRef}
            side="left"
            className="w-71.5 border-r border-border bg-surface-inset p-0"
          >
            <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
            <Sidebar
              collapsed={false}
              mobile
              onNavigate={() => setMobileOpen(false)}
              menuContainer={mobileSheetRef}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header
            onOpenNavigation={() => setMobileOpen(true)}
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((value) => !value)}
          />
          <main id="app-main-scroll" className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
