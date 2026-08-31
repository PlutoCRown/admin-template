import { useState } from "react";
import { type AppMenuRoute, type MenuOrder } from "#router/menu";
import { SortableMenuLevel } from "./sortable-menu-level";

interface MenuEditorProps {
  root: AppMenuRoute;
  order: MenuOrder;
  hiddenPaths: string[];
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
