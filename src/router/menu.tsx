import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  DashboardOutlined,
  FormOutlined,
  PictureOutlined,
  ProfileOutlined,
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

export const menuRoute: AppMenuRoute = {
  path: "/",
  routes: [
    {
      path: "/dashboard",
      name: "工作台",
      icon: <DashboardOutlined />,
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
  ],
};
