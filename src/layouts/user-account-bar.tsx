import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Tooltip } from "antd";
import { useUserStore } from "#stores/user";
import "./user-account-bar.css";

interface UserAccountBarProps {
  collapsed?: boolean;
  onOpenSettings: () => void;
}

export function UserAccountBar({ collapsed = false, onOpenSettings }: UserAccountBarProps) {
  const user = useUserStore((state) => state.user);
  const displayName = user?.nickname || user?.username || "未登录";
  const subtitle = user?.title || user?.department || user?.username || "";

  return (
    <div
      className={["user-account-bar", collapsed ? "user-account-bar-collapsed" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="user-account-bar-profile">
        <Avatar size={28} src={user?.avatar || undefined} icon={<UserOutlined />} />
        {!collapsed ? (
          <div className="user-account-bar-meta">
            <div className="user-account-bar-name" title={displayName}>
              {displayName}
            </div>
            {subtitle ? (
              <div className="user-account-bar-subtitle" title={subtitle}>
                {subtitle}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <Tooltip title="设置" placement={collapsed ? "right" : "top"}>
        <Button
          type="text"
          size="small"
          className="user-account-bar-settings"
          icon={<SettingOutlined />}
          aria-label="打开设置"
          onClick={onOpenSettings}
        />
      </Tooltip>
    </div>
  );
}
