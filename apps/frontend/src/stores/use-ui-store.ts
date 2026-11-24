import { create } from "zustand";

type SidebarState = "expanded" | "collapsed";

interface UiState {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;

  sidebarState: SidebarState;
  isCommandPaletteOpen: boolean;

  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;

  setCommanPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,

  sidebarState: "expanded",
  isCommandPaletteOpen: false,

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

  setSidebarState: (state) => set({ sidebarState: state }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarState: state.sidebarState === "expanded" ? "collapsed" : "expanded",
    })),

  setCommanPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
}));
