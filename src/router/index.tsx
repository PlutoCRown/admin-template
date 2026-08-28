import { createBrowserRouter, Navigate } from "react-router";
import { BasicLayout } from "#layouts/BasicLayout";
import { DashboardPage } from "#pages/dashboard";
import { LoginPage } from "#pages/login";
import { MediaFormPage } from "#pages/media";
import { NotFoundPage } from "#pages/not-found";
import { ProDescriptionsPage } from "#pages/pro/descriptions";
import { ProFormPage } from "#pages/pro/form";
import { ProListPage } from "#pages/pro/list";
import { SchemaFormPage } from "#pages/pro/schema-form";
import { ProTablePage } from "#pages/pro/table";
import { AuthGuard } from "./AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <BasicLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "pro/table", element: <ProTablePage /> },
          { path: "pro/form", element: <ProFormPage /> },
          { path: "pro/list", element: <ProListPage /> },
          { path: "pro/schema-form", element: <SchemaFormPage /> },
          { path: "pro/descriptions", element: <ProDescriptionsPage /> },
          { path: "media", element: <MediaFormPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
