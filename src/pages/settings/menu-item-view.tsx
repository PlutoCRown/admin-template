import { type ReactNode } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Switch } from "antd";
import { type AppMenuRoute } from "#router/menu";
import styles from "./menu-editor.module.css";

export interface MenuItemViewProps {
  item: AppMenuRoute;
  visible: boolean;
  collapsed: boolean;
  hasChildren: boolean;
  dragHandle: ReactNode;
  overlay?: boolean;
  onToggleCollapsed?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

export function MenuItemView({
  item,
  visible,
  collapsed,
  hasChildren,
  dragHandle,
  overlay = false,
  onToggleCollapsed,
  onVisibleChange,
}: MenuItemViewProps) {
  return (
    <div className={styles.item}>
      {dragHandle}
      {hasChildren ? (
        <Button
          type="text"
          size="small"
          className={styles.collapseButton}
          icon={collapsed ? <RightOutlined /> : <DownOutlined />}
          tabIndex={overlay ? -1 : undefined}
          aria-hidden={overlay || undefined}
          aria-label={
            overlay ? undefined : `${collapsed ? "展开" : "折叠"}${item.name ?? item.path}子菜单`
          }
          onClick={onToggleCollapsed}
        />
      ) : null}
      <span className={styles.itemIcon}>{item.icon}</span>
      <div className={styles.itemMain}>
        <div className={styles.itemName}>{item.name ?? item.path}</div>
        <div className={styles.itemPath}>{item.path}</div>
      </div>
      <Switch
        size="small"
        checked={visible}
        tabIndex={overlay ? -1 : undefined}
        aria-hidden={overlay || undefined}
        aria-label={overlay ? undefined : `显示${item.name ?? item.path}`}
        onChange={onVisibleChange}
      />
    </div>
  );
}
