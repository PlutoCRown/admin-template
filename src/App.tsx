import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { RouterProvider } from "react-router";
import { AppFeedback } from "#components/app-feedback";
import { router } from "./router";

dayjs.locale("zh-cn");

export function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp notification={{ placement: "topRight" }}>
        <AppFeedback />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
