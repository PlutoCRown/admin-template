import { useState, type CSSProperties, type ReactNode } from "react";
import { DownOutlined, HolderOutlined, RightOutlined } from "@ant-design/icons";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Switch } from "antd";
import { DragOverlaySurface } from "#components/drag-overlay-surface";
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

const MENU_SORT_TRANSITION = {
  duration: 250,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

const dropAnimation: DropAnimation = {
  duration: MENU_SORT_TRANSITION.duration,
  easing: MENU_SORT_TRANSITION.easing,
  sideEffects(params) {
    params.dragOverlay.node.querySelector(".is-lifted")?.classList.remove("is-lifted");
    return defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0" },
      },
    })(params);
  },
};

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
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.path, transition: MENU_SORT_TRANSITION });
  const hasChildren = Boolean(children);
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0 : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={["settings-menu-tree-item", isDragging ? "settings-menu-tree-item-dragging" : ""]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <MenuItemView
        item={item}
        visible={visible}
        collapsed={collapsed}
        hasChildren={hasChildren}
        onToggleCollapsed={onToggleCollapsed}
        onVisibleChange={(checked) => setVisible(item.path, checked)}
        dragHandle={
          <Button
            ref={setActivatorNodeRef}
            type="text"
            size="small"
            className="settings-menu-drag-handle"
            icon={<HolderOutlined />}
            aria-label={`拖动调整${item.name ?? item.path}顺序`}
            {...attributes}
            {...listeners}
          />
        }
      />
      {hasChildren && !collapsed ? children : null}
    </div>
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
          <Button
            type="text"
            size="small"
            className="settings-menu-drag-handle"
            icon={<HolderOutlined />}
            tabIndex={-1}
            aria-hidden
          />
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const items = getOrderedMenuRoutes(parent, order);
  const ids = items.map((item) => item.path);
  const activeItem = activeId ? items.find((item) => item.path === activeId) : undefined;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setOverlayWidth(active.rect.current.initial?.width);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverlayWidth(undefined);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverlayWidth(undefined);
    if (!over || active.id === over.id) {
      return;
    }
    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex >= 0 && toIndex >= 0) {
      moveItem(parent.path, fromIndex, toIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={nested ? "settings-menu-list settings-menu-list-nested" : "settings-menu-list"}
        >
          {items.map((item) => {
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
                onToggleCollapsed={() => onToggleCollapsed(item.path)}
              >
                {childMenu}
              </SortableMenuTreeItem>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
          <DragOverlaySurface
            className="settings-menu-drag-overlay"
            style={{ width: overlayWidth }}
          >
            <MenuBranchPreview
              item={activeItem}
              order={order}
              hiddenPaths={hiddenPaths}
              collapsedPaths={collapsedPaths}
            />
          </DragOverlaySurface>
        ) : null}
      </DragOverlay>
    </DndContext>
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
