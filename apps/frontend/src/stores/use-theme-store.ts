import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "causolve-theme";

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
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  updateBrowserThemeColor();
};

const saveTheme = (theme: Theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === "light" ? "light" : "dark";
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",

  initializeTheme: () => {
    const theme = getInitialTheme();

    applyTheme(theme);
    set({ theme });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    saveTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";

    applyTheme(theme);
    saveTheme(theme);
    set({ theme });
  },
}));
