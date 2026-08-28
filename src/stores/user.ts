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
        set((state) => {
          state.token = token;
          state.user = user;
        });
      },
      setUser: (user) => {
        set((state) => {
          state.user = user;
        });
      },
      clearAuth: () => {
        set((state) => {
          state.token = null;
          state.user = null;
        });
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
