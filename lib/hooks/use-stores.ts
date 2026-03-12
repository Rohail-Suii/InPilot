import { create } from "zustand";

interface SidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

interface ExtensionStore {
  isConnected: boolean;
  currentTask: string | null;
  setConnected: (connected: boolean) => void;
  setCurrentTask: (task: string | null) => void;
}

export const useExtensionStore = create<ExtensionStore>((set) => ({
  isConnected: false,
  currentTask: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setCurrentTask: (task) => set({ currentTask: task }),
}));
