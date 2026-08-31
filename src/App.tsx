import { useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { RouterProvider } from "react-router";
import { AppFeedback } from "#components/app-feedback";
import { useResolvedTheme } from "#hooks/use-resolved-theme";
import { router } from "./router";

dayjs.locale("zh-cn");

/**
 * squircle 会让同样的半径看起来更「方」，所以比 antd 默认 6/8/4/2 大约放大 1.6～2 倍。
 * corner-shape 本身不是 Design Token，在 global.css 里全局套上。
 */
const antdThemeToken: ThemeConfig["token"] = {
  borderRadius: 10,
  borderRadiusLG: 16,
  borderRadiusSM: 8,
  borderRadiusXS: 4,
  borderRadiusOuter: 8,
};

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
        token: antdThemeToken,
        cssVar: { key: "css-var-root" },
      }}
    >
      <AntdApp notification={{ placement: "topRight" }}>
        <AppFeedback />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
