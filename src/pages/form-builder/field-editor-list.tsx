import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
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
import { Button, Form, Input, Popconfirm, Tag } from "antd";
import { DragOverlaySurface } from "#components/drag-overlay-surface";
import { FormDigit, FormSelect, FormSwitch, FormText, ProForm } from "#components/form";
import { useFormBuilderStore } from "#stores/form-builder";
import {
  FIELD_TYPE_OPTIONS,
  fieldTypeHasOptions,
  fieldTypeHasPlaceholder,
  fieldTypeHasWidth,
  type FormBuilderFieldType,
} from "./schema";

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

function FieldEditorItem({ id }: { id: string }) {
  const epoch = useFormBuilderStore((state) => state.epoch);
  const field = useFormBuilderStore((state) => state.fields.find((item) => item.id === id));
  const updateField = useFormBuilderStore((state) => state.updateField);
  const changeFieldType = useFormBuilderStore((state) => state.changeFieldType);
  const removeField = useFormBuilderStore((state) => state.removeField);
  const [form] = Form.useForm();

  if (!field) {
    return null;
  }

  return (
    <ProCard
      size="small"
      className="form-builder-field-card"
      title={<DragHandle />}
      extra={
        <Popconfirm title="删除这个表单项？" onConfirm={() => removeField(id)}>
          <Button danger type="text" icon={<CloseOutlined />} aria-label={`删除 ${field.label}`} />
        </Popconfirm>
      }
      headerBordered={false}
    >
      <ProForm
        key={`${epoch}-${field.type}`}
        form={form}
        submitter={false}
        colon={false}
        preserve={false}
        labelWidth={5}
        size="middle"
        layout="vertical"
        style={{ height: "auto", overflow: "visible" }}
        initialValues={{
          label: field.label,
          name: field.name,
          type: field.type,
          width: field.width,
          placeholder: field.placeholder,
          required: field.required,
          block: field.block,
        }}
        onValuesChange={(changed) => {
          if (changed.type !== undefined) {
            changeFieldType(id, changed.type as FormBuilderFieldType);
            return;
          }
          if ("width" in changed && changed.width == null) {
            return;
          }
          updateField(id, changed);
        }}
      >
        <FormText name="label" label="显示名称" width={10} placeholder="显示名称" />
        <FormText
          name="name"
          label="字段名"
          width={10}
          placeholder="fieldName"
          fieldProps={{ className: "form-builder-field-name-input" }}
        />
        <FormSelect
          name="type"
          label="字段类型"
          width={9}
          options={FIELD_TYPE_OPTIONS}
          fieldProps={{ showSearch: true, optionFilterProp: "label" }}
        />
        {fieldTypeHasWidth(field.type) ? (
          <FormDigit
            name="width"
            label="表单项宽度"
            labelWidth={6}
            min={1}
            max={48}
            disabled={field.block}
          />
        ) : null}
        {fieldTypeHasPlaceholder(field.type) ? (
          <FormText name="placeholder" label="占位提示" width={12} placeholder="请输入占位提示" />
        ) : null}
        <FormSwitch name="required" label="必填" />
        <FormSwitch name="block" label="整行" />
      </ProForm>
      {fieldTypeHasOptions(field.type) ? (
        <OptionEditorList
          options={field.options}
          onChange={(options) => updateField(id, { options })}
        />
      ) : null}
    </ProCard>
  );
}

export function FieldEditorList() {
  const fields = useFormBuilderStore((state) => state.fields);
  const addField = useFormBuilderStore((state) => state.addField);
  const moveField = useFormBuilderStore((state) => state.moveField);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const ids = fields.map((field) => field.id);

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
      moveField(fromIndex, toIndex);
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
            <div className="form-builder-field-list-heading">
              <div className="form-builder-field-list-title">字段列表</div>
              <Tag color="blue">{fields.length} 个字段</Tag>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={addField}>
              新增字段
            </Button>
          </div>
          <div className="form-builder-field-list-body">
            {ids.map((id) => (
              <SortableListItem key={id} id={id}>
                <FieldEditorItem id={id} />
              </SortableListItem>
            ))}
          </div>
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? (
          <DragHandleContext.Provider value={<OverlayDragHandle />}>
            <DragOverlaySurface
              className="form-builder-sortable-overlay"
              style={{ width: overlayWidth }}
            >
              <FieldEditorItem id={activeId} />
            </DragOverlaySurface>
          </DragHandleContext.Provider>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
