import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

type ResolvedTheme = Exclude<Theme, "system">;

interface ThemeState {
  theme: Theme;
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "causolve-theme";

let removeSystemThemeListener: (() => void) | null = null;

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === "system" ? getSystemTheme() : theme;

const updateBrowserThemeColor = () => {
  const themeColorMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();

  if (themeColorMeta && backgroundColor) {
    themeColorMeta.content = backgroundColor;
  }
};

const applyTheme = (theme: Theme) => {
  const resolvedTheme = resolveTheme(theme);

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
  updateBrowserThemeColor();
};

const syncSystemThemeListener = (theme: Theme) => {
  removeSystemThemeListener?.();
  removeSystemThemeListener = null;

  if (theme !== "system" || typeof window === "undefined") return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleSystemThemeChange = () => applyTheme("system");

  mediaQuery.addEventListener("change", handleSystemThemeChange);

  removeSystemThemeListener = () => {
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
};

const saveTheme = (theme: Theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    savedTheme === "dark" ||
    savedTheme === "light" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",

  initializeTheme: () => {
    const theme = getInitialTheme();

    applyTheme(theme);
    syncSystemThemeListener(theme);
    set({ theme });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    syncSystemThemeListener(theme);
    saveTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const resolvedTheme = resolveTheme(currentTheme);
    const nextTheme: ResolvedTheme =
      resolvedTheme === "dark" ? "light" : "dark";

    get().setTheme(nextTheme);
  },
}));
