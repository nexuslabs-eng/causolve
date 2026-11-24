import { useThemeStore } from "@/stores/use-theme-store";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button
      type="button"
      variant="subtle"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="group relative ml-auto overflow-hidden border-primary/15 bg-surface-inset text-muted-foreground shadow-[inset_0_1px_0_var(--hairline)] hover:border-primary/35 hover:text-primary-bright md:ml-0"
    >
      <span className="relative h-4 w-4" aria-hidden="true">
        <Sun
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-300 ease-out",
            theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-300 ease-out",
            theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </span>
    </Button>
  );
};
