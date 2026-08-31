import { SortableHandleButton, type SortableHandleButtonProps } from "#components/sortable-list";
import styles from "./drag-handle.module.css";

interface DragHandleButtonProps extends SortableHandleButtonProps {}

export function DragHandleButton({ overlay, className, ...props }: DragHandleButtonProps) {
  return (
    <SortableHandleButton
      overlay={overlay}
      className={[styles.handle, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
