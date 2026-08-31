import { type ReactNode } from "react";
import { SortableHandleButton, SortableItem } from "#components/sortable-list";
import { type AppMenuRoute } from "#router/menu";
import { useGlobalConfigStore } from "#stores/global-config";
import { MenuItemView } from "./menu-item-view";
import styles from "./menu-editor.module.css";

interface SortableMenuTreeItemProps {
  item: AppMenuRoute;
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children?: ReactNode;
}

export function SortableMenuTreeItem({
  item,
  visible,
  collapsed,
  onToggleCollapsed,
  children,
}: SortableMenuTreeItemProps) {
  const setVisible = useGlobalConfigStore((state) => state.setMenuItemVisible);
  const hasChildren = Boolean(children);

  const handleVisibleChange = (checked: boolean) => {
    setVisible(item.path, checked);
  };

  return (
    <SortableItem
      id={item.path}
      className={styles.treeItem}
      draggingClassName={styles.treeItemDragging}
      draggingZIndex={1}
    >
      <MenuItemView
        item={item}
        visible={visible}
        collapsed={collapsed}
        hasChildren={hasChildren}
        onToggleCollapsed={onToggleCollapsed}
        onVisibleChange={handleVisibleChange}
        dragHandle={
          <SortableHandleButton
            size="small"
            className={styles.dragHandle}
            aria-label={`拖动调整${item.name ?? item.path}顺序`}
          />
        }
      />
      {hasChildren && !collapsed ? children : null}
    </SortableItem>
  );
}
