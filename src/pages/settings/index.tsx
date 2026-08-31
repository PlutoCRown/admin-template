import { BgColorsOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Grid, type TabsProps } from "antd";
import { FullScreenModal } from "#components/full-screen-modal";
import { AccountPanel } from "./account-panel";
import { AppearancePanel } from "./appearance-panel";
import { MenuPanel } from "./menu-panel";

export type SettingsSection = "appearance" | "menu" | "account";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
}

export function SettingsModal({
  open,
  onClose,
  initialSection = "appearance",
}: SettingsModalProps) {
  const screens = Grid.useBreakpoint();
  const margin = screens.md === false ? 24 : 96;

  const items: TabsProps["items"] = [
    {
      key: "appearance",
      label: "外观",
      icon: <BgColorsOutlined />,
      children: <AppearancePanel />,
    },
    {
      key: "menu",
      label: "侧边菜单",
      icon: <MenuOutlined />,
      children: <MenuPanel />,
    },
    {
      key: "account",
      label: "账号",
      icon: <UserOutlined />,
      children: <AccountPanel onLoggedOut={onClose} />,
    },
  ];

  return (
    <FullScreenModal
      open={open}
      onClose={onClose}
      margin={margin}
      destroyOnHidden
      defaultActiveKey={initialSection}
      items={items}
    />
  );
}
