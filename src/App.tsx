import { useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { RouterProvider } from "react-router";
import { AppFeedback } from "#components/app-feedback";
import { useResolvedTheme } from "#hooks/use-resolved-theme";
import { router } from "./router";

dayjs.locale("zh-cn");

export function App() {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = resolvedTheme;
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: resolvedTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntdApp notification={{ placement: "topRight" }}>
        <AppFeedback />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
