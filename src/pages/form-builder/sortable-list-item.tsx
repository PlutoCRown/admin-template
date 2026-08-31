import { type ReactNode } from "react";
import { SortableItem, preventLayoutAnimationAfterSorting } from "#components/sortable-list";

interface SortableListItemProps {
  id: string;
  children: ReactNode;
}

export function SortableListItem({ id, children }: SortableListItemProps) {
  return (
    <SortableItem
      id={id}
      style={{ position: "relative" }}
      draggingZIndex={2}
      animateLayoutChanges={preventLayoutAnimationAfterSorting}
    >
      {children}
    </SortableItem>
  );
}
