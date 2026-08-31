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
export type LargeNumberFormat = "none" | "western" | "chinese";
export type DateFormat = "none" | "date" | "relative";

interface DataDisplayConfig {
  largeNumberFormat: LargeNumberFormat;
  dateFormat: DateFormat;
}

export interface GlobalConfig {
  themeMode: ThemeMode;
  dataDisplay: DataDisplayConfig;
  menu: {
    order: MenuOrder;
    hiddenPaths: string[];
  };
}

interface GlobalConfigState extends GlobalConfig {
  setThemeMode: (mode: ThemeMode) => void;
  setLargeNumberFormat: (format: LargeNumberFormat) => void;
  setDateFormat: (format: DateFormat) => void;
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
    dataDisplay: {
      largeNumberFormat: "chinese",
      dateFormat: "relative",
    },
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
      dataDisplay: fallback.dataDisplay,
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
      setLargeNumberFormat: (largeNumberFormat) => {
        set((state) => {
          state.dataDisplay.largeNumberFormat = largeNumberFormat;
        });
      },
      setDateFormat: (dateFormat) => {
        set((state) => {
          state.dataDisplay.dateFormat = dateFormat;
        });
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
        dataDisplay: state.dataDisplay,
        menu: state.menu,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<GlobalConfig> & {
          dataDisplay?: Partial<DataDisplayConfig> & {
            formatLargeNumbers?: boolean;
            formatTime?: boolean;
          };
        };
        const menuPaths = getMenuPaths();
        const savedMenu = saved.menu ?? current.menu;
        const savedDataDisplay = saved.dataDisplay;
        return {
          ...current,
          themeMode: saved.themeMode ?? current.themeMode,
          dataDisplay: {
            largeNumberFormat:
              savedDataDisplay?.largeNumberFormat ??
              (savedDataDisplay?.formatLargeNumbers === false
                ? "none"
                : current.dataDisplay.largeNumberFormat),
            dateFormat:
              savedDataDisplay?.dateFormat ??
              (savedDataDisplay?.formatTime === false ? "none" : current.dataDisplay.dateFormat),
          },
          menu: {
            order: reconcileMenuOrder(savedMenu.order),
            hiddenPaths: savedMenu.hiddenPaths.filter((path) => menuPaths.has(path)),
          },
        };
      },
    },
  ),
);
