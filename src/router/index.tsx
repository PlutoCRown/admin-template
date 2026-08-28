import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { BasicLayout } from "#layouts/BasicLayout";
import { AuthGuard } from "./AuthGuard";
import { RouteLoading } from "./RouteLoading";

const DashboardPage = lazy(() =>
  import("#pages/dashboard").then((module) => ({ default: module.DashboardPage })),
);
const FormBuilderPage = lazy(() =>
  import("#pages/form-builder").then((module) => ({ default: module.FormBuilderPage })),
);
const LoginPage = lazy(() =>
  import("#pages/login").then((module) => ({ default: module.LoginPage })),
);
const MediaFormPage = lazy(() =>
  import("#pages/media").then((module) => ({ default: module.MediaFormPage })),
);
const NotFoundPage = lazy(() =>
  import("#pages/not-found").then((module) => ({ default: module.NotFoundPage })),
);
const ProDescriptionsPage = lazy(() =>
  import("#pages/pro/descriptions").then((module) => ({ default: module.ProDescriptionsPage })),
);
const ProFormPage = lazy(() =>
  import("#pages/pro/form").then((module) => ({ default: module.ProFormPage })),
);
const ProListPage = lazy(() =>
  import("#pages/pro/list").then((module) => ({ default: module.ProListPage })),
);
const SchemaFormPage = lazy(() =>
  import("#pages/pro/schema-form").then((module) => ({ default: module.SchemaFormPage })),
);
const ProTablePage = lazy(() =>
  import("#pages/pro/table").then((module) => ({ default: module.ProTablePage })),
);

function withRouteLoading(element: ReactNode, fullScreen = false) {
  return <Suspense fallback={<RouteLoading fullScreen={fullScreen} />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withRouteLoading(<LoginPage />, true),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <BasicLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: withRouteLoading(<DashboardPage />) },
          { path: "form-builder", element: withRouteLoading(<FormBuilderPage />) },
          { path: "pro/table", element: withRouteLoading(<ProTablePage />) },
          { path: "pro/form", element: withRouteLoading(<ProFormPage />) },
          { path: "pro/list", element: withRouteLoading(<ProListPage />) },
          { path: "pro/schema-form", element: withRouteLoading(<SchemaFormPage />) },
          {
            path: "pro/descriptions",
            element: withRouteLoading(<ProDescriptionsPage />),
          },
          { path: "media", element: withRouteLoading(<MediaFormPage />) },
          { path: "*", element: withRouteLoading(<NotFoundPage />) },
        ],
      },
    ],
  },
]);
