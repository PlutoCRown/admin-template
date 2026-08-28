import { Spin, Typography } from "antd";

interface RouteLoadingProps {
  fullScreen?: boolean;
}

export function RouteLoading({ fullScreen = false }: RouteLoadingProps) {
  return (
    <div
      aria-live="polite"
      aria-label="页面加载中"
      role="status"
      style={{
        width: "100%",
        minHeight: fullScreen ? "100vh" : 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Spin size="large" />
      <Typography.Text type="secondary">页面加载中…</Typography.Text>
    </div>
  );
}
