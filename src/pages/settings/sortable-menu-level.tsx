import { SortableList, type SortableMoveEvent } from "#components/sortable-list";
import { getOrderedMenuRoutes, type AppMenuRoute, type MenuOrder } from "#router/menu";
import { useGlobalConfigStore } from "#stores/global-config";
import { MenuBranchPreview } from "./menu-branch-preview";
import styles from "./menu-editor.module.css";
import { SortableMenuTreeItem } from "./sortable-menu-tree-item";

export interface SortableMenuLevelProps {
  parent: AppMenuRoute;
  order: MenuOrder;
  hiddenPaths: string[];
  collapsedPaths: string[];
  onToggleCollapsed: (path: string) => void;
  nested?: boolean;
}

export function SortableMenuLevel({
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
      overlayClassName={styles.dragOverlay}
    >
      <div className={nested ? `${styles.list} ${styles.listNested}` : styles.list}>
        {items.map(renderMenuItem)}
      </div>
    </SortableList>
  );
}
