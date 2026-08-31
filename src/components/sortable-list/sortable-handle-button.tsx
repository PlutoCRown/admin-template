import { type ComponentProps } from "react";
import { HolderOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useOptionalSortableItem } from "./sortable-list";

export interface SortableHandleButtonProps extends Omit<ComponentProps<typeof Button>, "ref"> {
  overlay?: boolean;
}

export function SortableHandleButton({
  overlay = false,
  icon,
  ...props
}: SortableHandleButtonProps) {
  const sortableItem = useOptionalSortableItem();
  if (!sortableItem && !overlay) {
    throw new Error("SortableHandleButton 必须在 SortableItem 内使用");
  }

  return (
    <Button
      {...(overlay ? undefined : sortableItem?.attributes)}
      {...(overlay ? undefined : sortableItem?.listeners)}
      {...props}
      ref={overlay ? undefined : sortableItem?.setActivatorNodeRef}
      type={props.type ?? "text"}
      icon={icon ?? <HolderOutlined />}
      tabIndex={overlay ? -1 : props.tabIndex}
      aria-hidden={overlay || props["aria-hidden"]}
    />
  );
}
