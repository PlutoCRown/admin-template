import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { UserProfile } from "#api/types";

interface UserState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  clearAuth: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        set({
          token,
          user,
        });
      },
      setUser: (user) => {
        set({ user });
      },
      clearAuth: () => {
        set({ token: null, user: null });
      },
    })),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
