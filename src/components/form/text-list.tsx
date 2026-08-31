import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { HolderOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProForm as AntProForm, type ProFormItemProps } from "@ant-design/pro-components";
import { Button, Input } from "antd";
import { chFormItemProps, type ChWidthProps } from "./ch";
import "./text-list.css";

export interface TextListProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** 是否可拖拽排序，默认 true */
  sortable?: boolean;
  /** 是否显示底部新增按钮，默认 true */
  creator?: boolean;
  /** 新增按钮文案 */
  creatorText?: string;
  /** 新增项的默认值 */
  creatorValue?: string | ((list: string[]) => string);
  /** 是否显示删除按钮，默认 true */
  removable?: boolean;
  disabled?: boolean;
  className?: string;
}

type DragHandleButtonProps = { overlay?: boolean } & ComponentProps<typeof Button>;

const SORTABLE_TRANSITION = {
  duration: 250,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  !(isSorting || wasDragging);
const dropAnimation: DropAnimation = {
  duration: SORTABLE_TRANSITION.duration,
  easing: SORTABLE_TRANSITION.easing,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0" },
    },
  }),
};

function DragHandleButton({ overlay, className, ...props }: DragHandleButtonProps) {
  return (
    <Button
      type="text"
      icon={<HolderOutlined />}
      className={["ch-text-list-drag-handle", className].filter(Boolean).join(" ")}
      tabIndex={overlay ? -1 : undefined}
      aria-hidden={overlay || undefined}
      {...props}
    />
  );
}

function nextItemId(prefix: string, sequence: { current: number }) {
  sequence.current += 1;
  return `${prefix}_${sequence.current}`;
}

function reconcileIds(
  prev: string[],
  length: number,
  prefix: string,
  sequence: { current: number },
) {
  if (prev.length === length) {
    return prev;
  }
  if (length > prev.length) {
    return [
      ...prev,
      ...Array.from({ length: length - prev.length }, () => nextItemId(prefix, sequence)),
    ];
  }
  return prev.slice(0, length);
}

function resolveCreatorValue(creatorValue: TextListProps["creatorValue"], list: string[]) {
  if (typeof creatorValue === "function") {
    return creatorValue(list);
  }
  return creatorValue ?? "";
}

function TextListRow({
  value,
  dragHandle,
  placeholder,
  removable,
  disabled,
  onChange,
  onRemove,
}: {
  value: string;
  dragHandle?: ReactNode;
  placeholder?: string;
  removable: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="ch-text-list-item">
      {dragHandle}
      <Input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {removable ? (
        <Button
          type="text"
          icon={<MinusCircleOutlined />}
          disabled={disabled}
          aria-label={`删除 ${value || "该项"}`}
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}

function SortableTextListRow({
  id,
  ...rowProps
}: {
  id: string;
} & ComponentProps<typeof TextListRow>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: SORTABLE_TRANSITION,
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="ch-text-list-row">
      <TextListRow
        {...rowProps}
        dragHandle={
          <DragHandleButton
            ref={setActivatorNodeRef}
            disabled={rowProps.disabled}
            aria-label="拖动调整顺序"
            {...attributes}
            {...listeners}
          />
        }
      />
    </div>
  );
}

export function TextList({
  value,
  onChange,
  placeholder,
  sortable = true,
  creator = true,
  creatorText = "添加一项",
  creatorValue,
  removable = true,
  disabled,
  className,
}: TextListProps) {
  const listId = useId();
  const sequence = useRef(0);
  const items = value ?? [];
  const [ids, setIds] = useState<string[]>(() => items.map(() => nextItemId(listId, sequence)));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const syncedIds = reconcileIds(ids, items.length, listId, sequence);
  if (syncedIds !== ids) {
    setIds(syncedIds);
  }
  const activeIndex = activeId ? syncedIds.indexOf(activeId) : -1;
  const activeValue = activeIndex >= 0 ? items[activeIndex] : undefined;
  const canSort = sortable && !disabled;

  const emit = (next: string[]) => {
    onChange?.(next);
  };
  const handleValueChange = (index: number, nextValue: string) => {
    emit(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  };
  const handleRemove = (index: number) => {
    emit(items.filter((_, itemIndex) => itemIndex !== index));
    setIds((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };
  const handleAdd = () => {
    emit([...items, resolveCreatorValue(creatorValue, items)]);
    setIds((prev) => [...prev, nextItemId(listId, sequence)]);
  };
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
    const fromIndex = syncedIds.indexOf(String(active.id));
    const toIndex = syncedIds.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    emit(arrayMove(items, fromIndex, toIndex));
    setIds((prev) =>
      arrayMove(reconcileIds(prev, items.length, listId, sequence), fromIndex, toIndex),
    );
  };

  const rows = items.map((item, index) => {
    const id = syncedIds[index];
    if (!id) {
      return null;
    }
    const rowProps = {
      value: item,
      placeholder,
      removable,
      disabled,
      onChange: (next: string) => handleValueChange(index, next),
      onRemove: () => handleRemove(index),
    };
    if (!canSort) {
      return (
        <div key={id} className="ch-text-list-row">
          <TextListRow {...rowProps} />
        </div>
      );
    }
    return <SortableTextListRow key={id} id={id} {...rowProps} />;
  });

  const list = (
    <div className={["ch-text-list", className].filter(Boolean).join(" ")}>
      {canSort ? (
        <SortableContext items={syncedIds} strategy={verticalListSortingStrategy}>
          <div className="ch-text-list-body">{rows}</div>
        </SortableContext>
      ) : (
        <div className="ch-text-list-body">{rows}</div>
      )}
      {creator ? (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          disabled={disabled}
          className="ch-text-list-creator"
          onClick={handleAdd}
        >
          {creatorText}
        </Button>
      ) : null}
    </div>
  );

  if (!canSort) {
    return list;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {list}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeValue != null && activeId ? (
          <div className="ch-text-list-row ch-text-list-overlay" style={{ width: overlayWidth }}>
            <TextListRow
              value={activeValue}
              placeholder={placeholder}
              removable={removable}
              dragHandle={<DragHandleButton overlay />}
              onChange={() => undefined}
              onRemove={() => undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export type FormTextListProps = Omit<ProFormItemProps, "placeholder"> &
  ChWidthProps &
  Omit<TextListProps, "value" | "onChange">;

export function FormTextList({
  width,
  labelWidth,
  block = true,
  placeholder,
  sortable,
  creator,
  creatorText,
  creatorValue,
  removable,
  disabled,
  className,
  style,
  ...rest
}: FormTextListProps) {
  const ch = chFormItemProps({ width, labelWidth, block }, { className, style });
  return (
    <AntProForm.Item {...rest} {...ch}>
      <TextList
        placeholder={placeholder}
        sortable={sortable}
        creator={creator}
        creatorText={creatorText}
        creatorValue={creatorValue}
        removable={removable}
        disabled={disabled}
      />
    </AntProForm.Item>
  );
}
