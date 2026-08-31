import { type ReactNode } from "react";
import { SortableItem, preventLayoutAnimationAfterSorting } from "#components/sortable-list";
import styles from "./sortable-list-item.module.css";

interface SortableListItemProps {
  id: string;
  children: ReactNode;
}

export function SortableListItem({ id, children }: SortableListItemProps) {
  return (
    <SortableItem
      id={id}
      className={styles.item}
      draggingZIndex={2}
      animateLayoutChanges={preventLayoutAnimationAfterSorting}
    >
      {children}
    </SortableItem>
  );
}
