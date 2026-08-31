import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { arrayMove } from "@dnd-kit/sortable";
import { ProForm as AntProForm, type ProFormItemProps } from "@ant-design/pro-components";
import { Button, Input } from "antd";
import {
  SortableHandleButton,
  SortableItem,
  SortableList,
  preventLayoutAnimationAfterSorting,
  type SortableMoveEvent,
} from "#components/sortable-list";
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

interface ItemIdState {
  ids: string[];
  sequence: number;
}

function createItemIdState(prefix: string, length: number): ItemIdState {
  return {
    ids: Array.from({ length }, (_, index) => `${prefix}_${index + 1}`),
    sequence: length,
  };
}

function reconcileItemIds(prev: ItemIdState, length: number, prefix: string) {
  if (prev.ids.length === length) {
    return prev;
  }
  if (length > prev.ids.length) {
    const addedCount = length - prev.ids.length;
    return {
      ids: [
        ...prev.ids,
        ...Array.from(
          { length: addedCount },
          (_, index) => `${prefix}_${prev.sequence + index + 1}`,
        ),
      ],
      sequence: prev.sequence + addedCount,
    };
  }
  return {
    ...prev,
    ids: prev.ids.slice(0, length),
  };
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
}: { id: string } & ComponentProps<typeof TextListRow>) {
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

function noop() {}

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
  const items = value ?? [];
  const [itemIdState, setItemIdState] = useState(() => createItemIdState(listId, items.length));
  const syncedItemIdState = reconcileItemIds(itemIdState, items.length, listId);
  if (syncedItemIdState !== itemIdState) {
    setItemIdState(syncedItemIdState);
  }
  const syncedIds = syncedItemIdState.ids;
  const canSort = sortable && !disabled;

  const emit = (next: string[]) => {
    onChange?.(next);
  };
  const handleValueChange = (index: number, nextValue: string) => {
    emit(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  };
  const handleRemove = (index: number) => {
    emit(items.filter((_, itemIndex) => itemIndex !== index));
    setItemIdState((prev) => ({
      ...prev,
      ids: prev.ids.filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const handleAdd = () => {
    emit([...items, resolveCreatorValue(creatorValue, items)]);
    setItemIdState((prev) => {
      const synced = reconcileItemIds(prev, items.length, listId);
      const sequence = synced.sequence + 1;
      return {
        ids: [...synced.ids, `${listId}_${sequence}`],
        sequence,
      };
    });
  };
  const handleMove = ({ fromIndex, toIndex }: SortableMoveEvent) => {
    emit(arrayMove(items, fromIndex, toIndex));
    setItemIdState((prev) => {
      const synced = reconcileItemIds(prev, items.length, listId);
      return {
        ...synced,
        ids: arrayMove(synced.ids, fromIndex, toIndex),
      };
    });
  };

  const renderOverlay = (activeId: string | number) => {
    const activeIndex = syncedIds.indexOf(String(activeId));
    const activeValue = activeIndex >= 0 ? items[activeIndex] : undefined;
    return activeValue == null ? null : (
      <TextListRow
        value={activeValue}
        placeholder={placeholder}
        removable={removable}
        dragHandle={<SortableHandleButton overlay className="ch-text-list-drag-handle" />}
        onChange={noop}
        onRemove={noop}
      />
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
      <div className="ch-text-list-body">{rows}</div>
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
    <SortableList
      ids={syncedIds}
      onMove={handleMove}
      renderOverlay={renderOverlay}
      overlayClassName="ch-text-list-row ch-text-list-overlay"
    >
      {list}
    </SortableList>
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
