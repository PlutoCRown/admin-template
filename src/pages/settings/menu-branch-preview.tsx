import { SortableHandleButton } from "#components/sortable-list";
import { getOrderedMenuRoutes, type AppMenuRoute, type MenuOrder } from "#router/menu";
import { MenuItemView } from "./menu-item-view";
import styles from "./menu-editor.module.css";

interface MenuBranchPreviewProps {
  item: AppMenuRoute;
  order: MenuOrder;
  hiddenPaths: string[];
  collapsedPaths: string[];
}

export function MenuBranchPreview({
  item,
  order,
  hiddenPaths,
  collapsedPaths,
}: MenuBranchPreviewProps) {
  const children = getOrderedMenuRoutes(item, order);
  const hasChildren = children.length > 0;
  const collapsed = collapsedPaths.includes(item.path);

  return (
    <div className={styles.treeItem}>
      <MenuItemView
        item={item}
        visible={!hiddenPaths.includes(item.path)}
        collapsed={collapsed}
        hasChildren={hasChildren}
        overlay
        dragHandle={<SortableHandleButton overlay size="small" className={styles.dragHandle} />}
      />
      {hasChildren && !collapsed ? (
        <div className={`${styles.list} ${styles.listNested}`}>
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
