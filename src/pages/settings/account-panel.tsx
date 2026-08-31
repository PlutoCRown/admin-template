import { useState } from "react";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Descriptions, Space, Typography } from "antd";
import { useNavigate } from "react-router";
import { logoutApi } from "#api/login";
import { useUserStore } from "#stores/user";
import styles from "./settings.module.css";

interface AccountPanelProps {
  onLoggedOut: () => void;
}

export function AccountPanel({ onLoggedOut }: AccountPanelProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearAuth = useUserStore((state) => state.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch {
      // 错误已由接口拦截器 Notification 提示
    }
    clearAuth();
    onLoggedOut();
    message.success("已退出登录");
    void navigate("/login", { replace: true });
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>账号</h2>
      <p className={styles.panelDesc}>查看当前登录账号信息，或退出登录。</p>
      <div className={styles.section}>
        <Space size={16} align="start">
          <Avatar size={64} src={user?.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <Typography.Title level={4} className={styles.nickname}>
              {user?.nickname || "未命名用户"}
            </Typography.Title>
            <Typography.Text type="secondary">{user?.username}</Typography.Text>
          </div>
        </Space>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="姓名">{user?.nickname || "-"}</Descriptions.Item>
          <Descriptions.Item label="账号">{user?.username || "-"}</Descriptions.Item>
          <Descriptions.Item label="部门">{user?.department || "-"}</Descriptions.Item>
          <Descriptions.Item label="职位">{user?.title || "-"}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || "-"}</Descriptions.Item>
          <Descriptions.Item label="手机">{user?.phone || "-"}</Descriptions.Item>
        </Descriptions>
        <div className={styles.accountActions}>
          <Button
            danger
            icon={<LogoutOutlined />}
            loading={loggingOut}
            onClick={() => void handleLogout()}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
