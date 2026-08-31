import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    immer((set) => ({
      mode: "system",
      setMode: (mode) => {
        set({ mode });
      },
    })),
    {
      name: "admin-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
      }),
    },
  ),
);
