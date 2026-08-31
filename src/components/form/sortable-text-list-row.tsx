import {
  SortableHandleButton,
  SortableItem,
  preventLayoutAnimationAfterSorting,
} from "#components/sortable-list";
import { TextListRow, type TextListRowProps } from "./text-list-row";

interface SortableTextListRowProps extends TextListRowProps {
  id: string;
}

export function SortableTextListRow({ id, ...rowProps }: SortableTextListRowProps) {
  return (
    <SortableItem
      id={id}
      className="ch-text-list-row"
      animateLayoutChanges={preventLayoutAnimationAfterSorting}
    >
      <TextListRow
        {...rowProps}
        dragHandle={
          <SortableHandleButton
            className="ch-text-list-drag-handle"
            disabled={rowProps.disabled}
            aria-label="拖动调整顺序"
          />
        }
      />
    </SortableItem>
  );
}
