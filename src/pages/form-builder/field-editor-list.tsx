import {
  createContext,
  useContext,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CloseOutlined,
  HolderOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
import { ProCard } from "@ant-design/pro-components";
import { Button, Input, InputNumber, Popconfirm, Select, Switch } from "antd";
import { DragOverlaySurface } from "#components/drag-overlay-surface";
import {
  FIELD_TYPE_OPTIONS,
  applyFieldTypeDefaults,
  createFormBuilderField,
  fieldTypeHasOptions,
  fieldTypeHasPlaceholder,
  fieldTypeHasWidth,
  type FormBuilderField,
  type FormBuilderFieldType,
} from "./schema";

interface FieldEditorListProps {
  fields: FormBuilderField[];
  onChange: (fields: FormBuilderField[]) => void;
}

interface FieldEditorItemProps {
  field: FormBuilderField;
  onUpdate: (id: string, patch: Partial<FormBuilderField>) => void;
  onRemove: (id: string) => void;
}

interface RemoveActionProps {
  field: FormBuilderField;
  onRemove: (id: string) => void;
}

interface OptionEditorListProps {
  options: string[];
  onChange: (options: string[]) => void;
}

interface SortableListItemProps {
  id: string;
  children: ReactNode;
}

interface SortableOptionItemProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const DragHandleContext = createContext<ReactNode>(null);
const SORTABLE_TRANSITION = {
  duration: 250,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};
/** DragOverlay 归位时不要再播一遍布局补间，否则会闪一下交换 */
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  !(isSorting || wasDragging);
const dropAnimation: DropAnimation = {
  duration: SORTABLE_TRANSITION.duration,
  easing: SORTABLE_TRANSITION.easing,
  sideEffects(params) {
    params.dragOverlay.node.querySelector(".is-lifted")?.classList.remove("is-lifted");
    return defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0" },
      },
    })(params);
  },
};

let optionIdSequence = 0;
function createOptionId() {
  optionIdSequence += 1;
  return `form_builder_option_${Date.now()}_${optionIdSequence}`;
}

function reconcileOptionIds(prev: string[], length: number) {
  if (prev.length === length) {
    return prev;
  }
  if (length > prev.length) {
    return [...prev, ...Array.from({ length: length - prev.length }, () => createOptionId())];
  }
  return prev.slice(0, length);
}

function OptionRowView({
  value,
  dragHandle,
  onChange,
  onRemove,
}: {
  value: string;
  dragHandle: ReactNode;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="form-builder-option-item">
      {dragHandle}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="选项文案"
      />
      <Button
        type="text"
        icon={<MinusCircleOutlined />}
        aria-label={`删除选项 ${value || ""}`}
        onClick={onRemove}
      />
    </div>
  );
}

function SortableOptionItem({ id, value, onChange, onRemove }: SortableOptionItemProps) {
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
    <div ref={setNodeRef} style={style} className="form-builder-sortable-option">
      <OptionRowView
        value={value}
        onChange={onChange}
        onRemove={onRemove}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="form-builder-drag-handle form-builder-option-drag-handle"
            aria-label="拖动调整选项顺序"
            {...attributes}
            {...listeners}
          >
            <HolderOutlined />
          </button>
        }
      />
    </div>
  );
}

function OptionEditorList({ options, onChange }: OptionEditorListProps) {
  const [ids, setIds] = useState<string[]>(() => options.map(() => createOptionId()));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const syncedIds = reconcileOptionIds(ids, options.length);
  if (syncedIds !== ids) {
    setIds(syncedIds);
  }
  const activeIndex = activeId ? syncedIds.indexOf(activeId) : -1;
  const activeValue = activeIndex >= 0 ? options[activeIndex] : undefined;

  const handleValueChange = (index: number, value: string) => {
    onChange(options.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };
  const handleRemove = (index: number) => {
    onChange(options.filter((_, itemIndex) => itemIndex !== index));
    setIds((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };
  const handleAdd = () => {
    onChange([...options, `选项${options.length + 1}`]);
    setIds((prev) => [...prev, createOptionId()]);
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
    onChange(arrayMove(options, fromIndex, toIndex));
    setIds((prev) => arrayMove(reconcileOptionIds(prev, options.length), fromIndex, toIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="form-builder-option-list">
        <div className="form-builder-option-list-header">
          <div className="form-builder-option-list-title">选项</div>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
            新增选项
          </Button>
        </div>
        <SortableContext items={syncedIds} strategy={verticalListSortingStrategy}>
          <div className="form-builder-option-list-body">
            {options.map((value, index) => {
              const id = syncedIds[index];
              if (!id) {
                return null;
              }
              return (
                <SortableOptionItem
                  key={id}
                  id={id}
                  value={value}
                  onChange={(next) => handleValueChange(index, next)}
                  onRemove={() => handleRemove(index)}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeValue != null && activeId ? (
          <DragOverlaySurface
            className="form-builder-sortable-option form-builder-option-overlay"
            style={{ width: overlayWidth }}
          >
            <OptionRowView
              value={activeValue}
              onChange={() => undefined}
              onRemove={() => undefined}
              dragHandle={
                <button
                  type="button"
                  className="form-builder-drag-handle form-builder-option-drag-handle"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <HolderOutlined />
                </button>
              }
            />
          </DragOverlaySurface>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function OverlayDragHandle() {
  return (
    <button type="button" className="form-builder-drag-handle" tabIndex={-1} aria-hidden="true">
      <HolderOutlined />
    </button>
  );
}

function DragHandle() {
  return useContext(DragHandleContext);
}

function SortableListItem({ id, children }: SortableListItemProps) {
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
    position: "relative",
    zIndex: isDragging ? 2 : undefined,
    opacity: isDragging ? 0 : undefined,
  };
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="form-builder-drag-handle"
      aria-label="拖动调整顺序"
      {...attributes}
      {...listeners}
    >
      <HolderOutlined />
    </button>
  );

  return (
    <DragHandleContext.Provider value={handle}>
      <div ref={setNodeRef} style={style} className="form-builder-sortable-item">
        {children}
      </div>
    </DragHandleContext.Provider>
  );
}

function FieldEditorItem({ field, onUpdate, onRemove }: FieldEditorItemProps) {
  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { label: event.target.value });
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { name: event.target.value });
  };
  const handleTypeChange = (type: FormBuilderFieldType) => {
    onUpdate(field.id, applyFieldTypeDefaults(field, type));
  };
  const handleWidthChange = (width: number | null) => {
    if (width !== null) {
      onUpdate(field.id, { width });
    }
  };
  const handleRequiredChange = (required: boolean) => {
    onUpdate(field.id, { required });
  };
  const handleBlockChange = (block: boolean) => {
    onUpdate(field.id, { block });
  };
  const handlePlaceholderChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { placeholder: event.target.value });
  };
  const handleOptionsChange = (options: string[]) => {
    onUpdate(field.id, { options });
  };

  return (
    <ProCard
      size="small"
      type="inner"
      className="form-builder-field-card"
      title={<DragHandle />}
      extra={<RemoveAction field={field} onRemove={onRemove} />}
      headerBordered={false}
      styles={{
        header: { minHeight: 0, paddingBlock: 4, paddingInline: 8 },
        body: { padding: "8px 12px 12px" },
        title: { paddingInlineStart: 0, fontWeight: 400 },
        extra: { paddingInlineEnd: 0 },
      }}
    >
      <div className="form-builder-field-grid">
        <label className="form-builder-field-control">
          <span>显示名称</span>
          <Input value={field.label} onChange={handleLabelChange} placeholder="显示名称" />
        </label>
        <label className="form-builder-field-control">
          <span>字段名</span>
          <Input
            className="form-builder-field-name-input"
            value={field.name}
            onChange={handleNameChange}
            placeholder="fieldName"
          />
        </label>
        <label className="form-builder-field-control">
          <span>字段类型</span>
          <Select
            value={field.type}
            options={FIELD_TYPE_OPTIONS}
            onChange={handleTypeChange}
            showSearch
            optionFilterProp="label"
          />
        </label>
        {fieldTypeHasWidth(field.type) ? (
          <label className="form-builder-field-control form-builder-field-width-control">
            <span>表单项宽度</span>
            <InputNumber
              min={1}
              max={48}
              value={field.width}
              onChange={handleWidthChange}
              disabled={field.block}
            />
          </label>
        ) : null}
        {fieldTypeHasPlaceholder(field.type) ? (
          <label className="form-builder-field-control form-builder-field-placeholder-control">
            <span>占位提示</span>
            <Input
              value={field.placeholder}
              onChange={handlePlaceholderChange}
              placeholder="请输入占位提示"
            />
          </label>
        ) : null}
        <label className="form-builder-field-switch">
          <span>必填</span>
          <Switch size="small" checked={field.required} onChange={handleRequiredChange} />
        </label>
        <label className="form-builder-field-switch">
          <span>整行</span>
          <Switch size="small" checked={field.block} onChange={handleBlockChange} />
        </label>
      </div>
      {fieldTypeHasOptions(field.type) ? (
        <OptionEditorList options={field.options} onChange={handleOptionsChange} />
      ) : null}
    </ProCard>
  );
}

function RemoveAction({ field, onRemove }: RemoveActionProps) {
  const handleRemove = () => {
    onRemove(field.id);
  };
  return (
    <Popconfirm title="删除这个表单项？" onConfirm={handleRemove}>
      <Button danger type="text" icon={<CloseOutlined />} aria-label={`删除 ${field.label}`} />
    </Popconfirm>
  );
}

export function FieldEditorList({ fields, onChange }: FieldEditorListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const ids = fields.map((field) => field.id);
  const activeField = activeId ? fields.find((field) => field.id === activeId) : undefined;

  const handleUpdate = (id: string, patch: Partial<FormBuilderField>) => {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };
  const handleRemove = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };
  const handleAdd = () => {
    onChange([...fields, createFormBuilderField()]);
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
    const fromIndex = fields.findIndex((field) => field.id === active.id);
    const toIndex = fields.findIndex((field) => field.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) {
      onChange(arrayMove(fields, fromIndex, toIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="form-builder-field-list">
          <div className="form-builder-field-list-header">
            <div className="form-builder-field-list-title">字段列表</div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增字段
            </Button>
          </div>
          <div className="form-builder-field-list-body">
            {fields.map((field) => (
              <SortableListItem key={field.id} id={field.id}>
                <FieldEditorItem field={field} onUpdate={handleUpdate} onRemove={handleRemove} />
              </SortableListItem>
            ))}
          </div>
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeField ? (
          <DragHandleContext.Provider value={<OverlayDragHandle />}>
            <DragOverlaySurface
              className="form-builder-sortable-overlay"
              style={{ width: overlayWidth }}
            >
              <FieldEditorItem
                field={activeField}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            </DragOverlaySurface>
          </DragHandleContext.Provider>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
