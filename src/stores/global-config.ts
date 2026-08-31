import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  getDefaultMenuOrder,
  menuRoute,
  reconcileMenuOrder,
  type AppMenuRoute,
  type MenuOrder,
} from "#router/menu";

export type ThemeMode = "light" | "dark" | "system";

export interface GlobalConfig {
  themeMode: ThemeMode;
  menu: {
    order: MenuOrder;
    hiddenPaths: string[];
  };
}

interface GlobalConfigState extends GlobalConfig {
  setThemeMode: (mode: ThemeMode) => void;
  setMenuItemVisible: (path: string, visible: boolean) => void;
  moveMenuItem: (parentPath: string, fromIndex: number, toIndex: number) => void;
  resetMenu: () => void;
}

function getMenuPaths(route: AppMenuRoute = menuRoute): Set<string> {
  const paths = new Set<string>();
  const visit = (item: AppMenuRoute) => {
    item.routes?.forEach((child) => {
      paths.add(child.path);
      visit(child);
    });
  };
  visit(route);
  return paths;
}

function readLegacyState(): GlobalConfig {
  const fallback: GlobalConfig = {
    themeMode: "system",
    menu: {
      order: getDefaultMenuOrder(),
      hiddenPaths: [],
    },
  };
  if (typeof localStorage === "undefined") {
    return fallback;
  }

  try {
    const oldTheme = JSON.parse(localStorage.getItem("admin-theme") ?? "null") as {
      state?: { mode?: ThemeMode };
    } | null;
    const oldMenu = JSON.parse(localStorage.getItem("admin-menu") ?? "null") as {
      state?: { order?: MenuOrder; hiddenPaths?: string[] };
    } | null;
    return {
      themeMode: oldTheme?.state?.mode ?? fallback.themeMode,
      menu: {
        order: reconcileMenuOrder(oldMenu?.state?.order ?? fallback.menu.order),
        hiddenPaths: oldMenu?.state?.hiddenPaths ?? fallback.menu.hiddenPaths,
      },
    };
  } catch {
    return fallback;
  }
}

const initialConfig = readLegacyState();

export const useGlobalConfigStore = create<GlobalConfigState>()(
  persist(
    immer((set) => ({
      ...initialConfig,
      setThemeMode: (themeMode) => {
        set({ themeMode });
      },
      setMenuItemVisible: (path, visible) => {
        set((state) => {
          if (visible) {
            state.menu.hiddenPaths = state.menu.hiddenPaths.filter((item) => item !== path);
          } else if (!state.menu.hiddenPaths.includes(path)) {
            state.menu.hiddenPaths.push(path);
          }
        });
      },
      moveMenuItem: (parentPath, fromIndex, toIndex) => {
        set((state) => {
          const paths = state.menu.order[parentPath];
          if (
            !paths ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= paths.length ||
            toIndex >= paths.length
          ) {
            return;
          }
          const [moved] = paths.splice(fromIndex, 1);
          if (moved) {
            paths.splice(toIndex, 0, moved);
          }
        });
      },
      resetMenu: () => {
        set((state) => {
          state.menu = {
            order: getDefaultMenuOrder(),
            hiddenPaths: [],
          };
        });
      },
    })),
    {
      name: "admin-global-config",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        menu: state.menu,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<GlobalConfig>;
        const menuPaths = getMenuPaths();
        const savedMenu = saved.menu ?? current.menu;
        return {
          ...current,
          themeMode: saved.themeMode ?? current.themeMode,
          menu: {
            order: reconcileMenuOrder(savedMenu.order),
            hiddenPaths: savedMenu.hiddenPaths.filter((path) => menuPaths.has(path)),
          },
        };
      },
    },
  ),
);
