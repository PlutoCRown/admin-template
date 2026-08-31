import { useEffect } from "react";
import { App } from "antd";
import { bindApiNotification } from "#api/base/notify";

export function AppFeedback() {
  const { notification } = App.useApp();

  useEffect(() => {
    bindApiNotification(notification);
  }, [notification]);

  return null;
}
