import { SortableList, type SortableMoveEvent } from "#components/sortable-list";
import { useFormBuilderStore } from "#stores/form-builder";
import { FieldEditorItem } from "./field-editor-item";
import { SortableListItem } from "./sortable-list-item";
import styles from "./field-editor-list.module.css";

function renderFieldOverlay(activeId: string | number) {
  return <FieldEditorItem id={String(activeId)} overlay />;
}

function renderField(id: string) {
  return (
    <SortableListItem key={id} id={id}>
      <FieldEditorItem id={id} />
    </SortableListItem>
  );
}

export function FieldEditorList() {
  const fields = useFormBuilderStore((state) => state.fields);
  const moveField = useFormBuilderStore((state) => state.moveField);
  const ids = fields.map((field) => field.id);

  const handleMove = ({ fromIndex, toIndex }: SortableMoveEvent) => {
    moveField(fromIndex, toIndex);
  };
  return (
    <SortableList
      ids={ids}
      onMove={handleMove}
      renderOverlay={renderFieldOverlay}
      overlayClassName={styles.overlay}
    >
      <div className={styles.list}>{ids.map(renderField)}</div>
    </SortableList>
  );
}
