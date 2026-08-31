import { useState, type ReactNode } from "react";
import {
  ArrowLeftOutlined,
  BgColorsOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Descriptions, Modal, Segmented, Space, Typography } from "antd";
import { useNavigate } from "react-router";
import { logoutApi } from "#api/auth";
import { useThemeStore, type ThemeMode } from "#stores/theme";
import { useUserStore } from "#stores/user";
import "./settings-modal.css";

export type SettingsSection = "appearance" | "account";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
}

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "跟随系统", value: "system" },
];

const NAV_ITEMS: { key: SettingsSection; icon: ReactNode; label: string }[] = [
  {
    key: "appearance",
    icon: <BgColorsOutlined />,
    label: "外观",
  },
  {
    key: "account",
    icon: <UserOutlined />,
    label: "账号",
  },
];

function AppearancePanel() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div className="settings-modal-panel">
      <h2 className="settings-modal-panel-title">外观</h2>
      <p className="settings-modal-panel-desc">选择界面主题，可固定浅色/深色，或跟随系统偏好。</p>
      <div className="settings-modal-section">
        <div className="settings-modal-section-label">主题</div>
        <Segmented
          options={THEME_OPTIONS}
          value={mode}
          onChange={(value) => setMode(value)}
          style={{ alignSelf: "flex-start" }}
        />
      </div>
    </div>
  );
}

function AccountPanel({ onLoggedOut }: { onLoggedOut: () => void }) {
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
    <div className="settings-modal-panel">
      <h2 className="settings-modal-panel-title">账号</h2>
      <p className="settings-modal-panel-desc">查看当前登录账号信息，或退出登录。</p>
      <div className="settings-modal-section">
        <Space size={16} align="start">
          <Avatar size={64} src={user?.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
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
        <div className="settings-modal-account-actions">
          <Button
            danger
            icon={<LogoutOutlined />}
            loading={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({
  open,
  onClose,
  initialSection = "appearance",
}: SettingsModalProps) {
  const [section, setSection] = useState<SettingsSection>(initialSection);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      footer={null}
      closable={false}
      destroyOnHidden
      centered
      width="calc(100vw - 96px)"
      rootClassName="settings-modal"
      styles={{
        container: {
          height: "calc(100vh - 96px)",
          padding: 0,
          overflow: "hidden",
        },
        body: {
          height: "100%",
          padding: 0,
          overflow: "hidden",
        },
        header: {
          display: "none",
        },
      }}
      afterOpenChange={(nextOpen) => {
        if (nextOpen) {
          setSection(initialSection);
        }
      }}
    >
      <div className="settings-modal-layout">
        <aside className="settings-modal-sider">
          <button type="button" className="settings-modal-back" onClick={onClose}>
            <ArrowLeftOutlined />
            <span>返回应用</span>
          </button>
          <nav className="settings-modal-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  "settings-modal-nav-item",
                  section === item.key ? "settings-modal-nav-item-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSection(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {section === "appearance" ? (
          <AppearancePanel />
        ) : (
          <AccountPanel
            onLoggedOut={() => {
              onClose();
            }}
          />
        )}
      </div>
    </Modal>
  );
}
