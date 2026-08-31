import { useState, type ReactNode } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Switch } from "antd";
import {
  SortableHandleButton,
  SortableItem,
  SortableList,
  type SortableMoveEvent,
} from "#components/sortable-list";
import { getOrderedMenuRoutes, type AppMenuRoute, type MenuOrder } from "#router/menu";
import { useGlobalConfigStore } from "#stores/global-config";
import "./menu-editor.css";

interface MenuEditorProps {
  root: AppMenuRoute;
  order: MenuOrder;
  hiddenPaths: string[];
}

interface SortableMenuLevelProps extends Omit<MenuEditorProps, "root"> {
  parent: AppMenuRoute;
  collapsedPaths: string[];
  onToggleCollapsed: (path: string) => void;
  nested?: boolean;
}

interface MenuItemViewProps {
  item: AppMenuRoute;
  visible: boolean;
  collapsed: boolean;
  hasChildren: boolean;
  dragHandle: ReactNode;
  overlay?: boolean;
  onToggleCollapsed?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

function MenuItemView({
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
    <div className="settings-menu-item">
      {dragHandle}
      {hasChildren ? (
        <Button
          type="text"
          size="small"
          className="settings-menu-collapse-button"
          icon={collapsed ? <RightOutlined /> : <DownOutlined />}
          tabIndex={overlay ? -1 : undefined}
          aria-hidden={overlay || undefined}
          aria-label={
            overlay ? undefined : `${collapsed ? "展开" : "折叠"}${item.name ?? item.path}子菜单`
          }
          onClick={onToggleCollapsed}
        />
      ) : null}
      <span className="settings-menu-item-icon">{item.icon}</span>
      <div className="settings-menu-item-main">
        <div className="settings-menu-item-name">{item.name ?? item.path}</div>
        <div className="settings-menu-item-path">{item.path}</div>
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

function SortableMenuTreeItem({
  item,
  visible,
  collapsed,
  onToggleCollapsed,
  children,
}: {
  item: AppMenuRoute;
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children?: ReactNode;
}) {
  const setVisible = useGlobalConfigStore((state) => state.setMenuItemVisible);
  const hasChildren = Boolean(children);
  const handleVisibleChange = (checked: boolean) => {
    setVisible(item.path, checked);
  };

  return (
    <SortableItem
      id={item.path}
      className="settings-menu-tree-item"
      draggingClassName="settings-menu-tree-item-dragging"
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
            className="settings-menu-drag-handle"
            aria-label={`拖动调整${item.name ?? item.path}顺序`}
          />
        }
      />
      {hasChildren && !collapsed ? children : null}
    </SortableItem>
  );
}

function MenuBranchPreview({
  item,
  order,
  hiddenPaths,
  collapsedPaths,
}: {
  item: AppMenuRoute;
  order: MenuOrder;
  hiddenPaths: string[];
  collapsedPaths: string[];
}) {
  const children = getOrderedMenuRoutes(item, order);
  const hasChildren = children.length > 0;
  const collapsed = collapsedPaths.includes(item.path);

  return (
    <div className="settings-menu-tree-item">
      <MenuItemView
        item={item}
        visible={!hiddenPaths.includes(item.path)}
        collapsed={collapsed}
        hasChildren={hasChildren}
        overlay
        dragHandle={
          <SortableHandleButton overlay size="small" className="settings-menu-drag-handle" />
        }
      />
      {hasChildren && !collapsed ? (
        <div className="settings-menu-list settings-menu-list-nested">
          {children.map((child) => (
            <MenuBranchPreview
              key={child.path}
              item={child}
              order={order}
              hiddenPaths={hiddenPaths}
              collapsedPaths={collapsedPaths}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SortableMenuLevel({
  parent,
  order,
  hiddenPaths,
  collapsedPaths,
  onToggleCollapsed,
  nested = false,
}: SortableMenuLevelProps) {
  const moveItem = useGlobalConfigStore((state) => state.moveMenuItem);
  const items = getOrderedMenuRoutes(parent, order);
  const ids = items.map((item) => item.path);

  const handleMove = ({ fromIndex, toIndex }: SortableMoveEvent) => {
    moveItem(parent.path, fromIndex, toIndex);
  };

  const renderOverlay = (activeId: string | number) => {
    const activeItem = items.find((item) => item.path === activeId);
    return activeItem ? (
      <MenuBranchPreview
        item={activeItem}
        order={order}
        hiddenPaths={hiddenPaths}
        collapsedPaths={collapsedPaths}
      />
    ) : null;
  };

  const renderMenuItem = (item: AppMenuRoute) => {
    const handleToggleItemCollapsed = () => {
      onToggleCollapsed(item.path);
    };
    const childMenu = item.routes?.length ? (
      <SortableMenuLevel
        parent={item}
        order={order}
        hiddenPaths={hiddenPaths}
        collapsedPaths={collapsedPaths}
        onToggleCollapsed={onToggleCollapsed}
        nested
      />
    ) : null;
    return (
      <SortableMenuTreeItem
        key={item.path}
        item={item}
        visible={!hiddenPaths.includes(item.path)}
        collapsed={collapsedPaths.includes(item.path)}
        onToggleCollapsed={handleToggleItemCollapsed}
      >
        {childMenu}
      </SortableMenuTreeItem>
    );
  };

  return (
    <SortableList
      ids={ids}
      onMove={handleMove}
      renderOverlay={renderOverlay}
      overlayClassName="settings-menu-drag-overlay"
    >
      <div
        className={nested ? "settings-menu-list settings-menu-list-nested" : "settings-menu-list"}
      >
        {items.map(renderMenuItem)}
      </div>
    </SortableList>
  );
}

export function MenuEditor({ root, order, hiddenPaths }: MenuEditorProps) {
  const [collapsedPaths, setCollapsedPaths] = useState<string[]>([]);
  const handleToggleCollapsed = (path: string) => {
    setCollapsedPaths((paths) =>
      paths.includes(path) ? paths.filter((item) => item !== path) : [...paths, path],
    );
  };

  return (
    <SortableMenuLevel
      parent={root}
      order={order}
      hiddenPaths={hiddenPaths}
      collapsedPaths={collapsedPaths}
      onToggleCollapsed={handleToggleCollapsed}
    />
  );
}
