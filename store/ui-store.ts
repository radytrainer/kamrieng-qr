import { create } from "zustand"

interface UiState {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

/**
 * Global client UI state (sidebar, modals, etc). Server data (students,
 * teachers, attendance...) belongs in TanStack Query, not here — Zustand is
 * reserved for ephemeral client-only state.
 */
export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}))
