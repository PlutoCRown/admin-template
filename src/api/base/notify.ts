import type { NotificationInstance } from "antd/es/notification/interface";

let notificationApi: NotificationInstance | undefined;

export function bindApiNotification(api: NotificationInstance) {
  notificationApi = api;
}

export function notifyRequestError(message: string) {
  notificationApi?.error({
    message: "请求失败",
    description: message,
  });
}
