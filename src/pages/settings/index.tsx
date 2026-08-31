import { useState, type ReactNode } from "react";
import { ArrowLeftOutlined, BgColorsOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { AccountPanel } from "./account-panel";
import { AppearancePanel } from "./appearance-panel";
import { MenuPanel } from "./menu-panel";
import "./settings.css";

export type SettingsSection = "appearance" | "menu" | "account";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
}

const NAV_ITEMS: { key: SettingsSection; icon: ReactNode; label: string }[] = [
  {
    key: "appearance",
    icon: <BgColorsOutlined />,
    label: "外观",
  },
  {
    key: "menu",
    icon: <MenuOutlined />,
    label: "侧边菜单",
  },
  {
    key: "account",
    icon: <UserOutlined />,
    label: "账号",
  },
];

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
        {section === "appearance" ? <AppearancePanel /> : null}
        {section === "menu" ? <MenuPanel /> : null}
        {section === "account" ? <AccountPanel onLoggedOut={onClose} /> : null}
      </div>
    </Modal>
  );
}
