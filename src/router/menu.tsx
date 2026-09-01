import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  BuildOutlined,
  DashboardOutlined,
  EditOutlined,
  FormOutlined,
  PictureOutlined,
  ProfileOutlined,
  ReadOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

export interface AppMenuRoute {
  path: string;
  name?: string;
  icon?: ReactNode;
  hideInMenu?: boolean;
  routes?: AppMenuRoute[];
}

export type MenuOrder = Record<string, string[]>;

export interface MenuPreferences {
  order: MenuOrder;
  hiddenPaths: string[];
}

export const menuRoute: AppMenuRoute = {
  path: "/",
  routes: [
    {
      path: "/introduction",
      name: "项目介绍",
      icon: <ReadOutlined />,
    },
    {
      path: "/dashboard",
      name: "工作台",
      icon: <DashboardOutlined />,
    },
    {
      path: "/form-builder",
      name: "表单生成器",
      icon: <BuildOutlined />,
    },
    {
      path: "/pro",
      name: "Pro 组件",
      icon: <AppstoreOutlined />,
      routes: [
        { path: "/pro/table", name: "ProTable", icon: <TableOutlined /> },
        { path: "/pro/form", name: "ProForm", icon: <FormOutlined /> },
        { path: "/pro/list", name: "ProList", icon: <UnorderedListOutlined /> },
        { path: "/pro/schema-form", name: "SchemaForm", icon: <FormOutlined /> },
        { path: "/pro/descriptions", name: "ProDescriptions", icon: <ProfileOutlined /> },
      ],
    },
    {
      path: "/media",
      name: "媒体图册",
      icon: <PictureOutlined />,
    },
    {
      path: "/blog-manage",
      name: "MDX 活动页",
      icon: <EditOutlined />,
    },
  ],
};

export function getDefaultMenuOrder(route: AppMenuRoute = menuRoute): MenuOrder {
  const order: MenuOrder = {};

  const visit = (parent: AppMenuRoute) => {
    if (!parent.routes?.length) {
      return;
    }
    order[parent.path] = parent.routes.map((item) => item.path);
    parent.routes.forEach(visit);
  };

  visit(route);
  return order;
}

export function reconcileMenuOrder(order: MenuOrder, route: AppMenuRoute = menuRoute): MenuOrder {
  const defaults = getDefaultMenuOrder(route);

  return Object.fromEntries(
    Object.entries(defaults).map(([parentPath, defaultPaths]) => {
      const validPaths = new Set(defaultPaths);
      const savedPaths = (order[parentPath] ?? []).filter(
        (path, index, paths) => validPaths.has(path) && paths.indexOf(path) === index,
      );
      const reconciledPaths = [...savedPaths];

      for (const path of defaultPaths) {
        if (reconciledPaths.includes(path)) {
          continue;
        }
        const defaultIndex = defaultPaths.indexOf(path);
        const nextSavedPath = defaultPaths
          .slice(defaultIndex + 1)
          .find((candidate) => reconciledPaths.includes(candidate));
        const insertIndex = nextSavedPath ? reconciledPaths.indexOf(nextSavedPath) : -1;
        if (insertIndex >= 0) {
          reconciledPaths.splice(insertIndex, 0, path);
        } else {
          reconciledPaths.push(path);
        }
      }

      return [parentPath, reconciledPaths];
    }),
  );
}

export function getOrderedMenuRoutes(parent: AppMenuRoute, order: MenuOrder): AppMenuRoute[] {
  const routes = parent.routes ?? [];
  const routeByPath = new Map(routes.map((item) => [item.path, item]));
  const orderedPaths = reconcileMenuOrder(order, parent)[parent.path] ?? [];
  return orderedPaths.flatMap((path) => {
    const item = routeByPath.get(path);
    return item ? [item] : [];
  });
}

/** 保留完整路由树，只用 hideInMenu 控制 ProLayout 的菜单展示。 */
export function applyMenuPreferences(
  route: AppMenuRoute,
  preferences: MenuPreferences,
): AppMenuRoute {
  const hiddenPaths = new Set(preferences.hiddenPaths);

  const visit = (item: AppMenuRoute): AppMenuRoute => ({
    ...item,
    hideInMenu: item.hideInMenu || hiddenPaths.has(item.path),
    routes: getOrderedMenuRoutes(item, preferences.order).map(visit),
  });

  return visit(route);
}
