import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CloseOutlined, HolderOutlined } from "@ant-design/icons";
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
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProCard } from "@ant-design/pro-components";
import { Button, Form, Popconfirm } from "antd";
import { DragOverlaySurface } from "#components/drag-overlay-surface";
import { FormDigit, FormSelect, FormSwitch, FormText, ProForm, TextList } from "#components/form";
import { useFormBuilderStore } from "#stores/form-builder";
import {
  FIELD_TYPE_OPTIONS,
  fieldTypeHasAllowClear,
  fieldTypeHasListControls,
  fieldTypeHasOptions,
  fieldTypeHasPlaceholder,
  fieldTypeHasWidth,
  type FormBuilderFieldType,
} from "./schema";

interface SortableListItemProps {
  id: string;
  children: ReactNode;
}

function DragHandleButton({
  overlay,
  className,
  ...props
}: { overlay?: boolean } & ComponentProps<typeof Button>) {
  return (
    <Button
      type="text"
      icon={<HolderOutlined />}
      className={["form-builder-drag-handle", className].filter(Boolean).join(" ")}
      tabIndex={overlay ? -1 : undefined}
      aria-hidden={overlay || undefined}
      {...props}
    />
  );
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

function OverlayDragHandle() {
  return <DragHandleButton overlay />;
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
    <DragHandleButton
      ref={setActivatorNodeRef}
      aria-label="拖动调整顺序"
      {...attributes}
      {...listeners}
    />
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
          allowClear: field.allowClear ?? true,
          creator: field.creator ?? true,
          sortable: field.sortable ?? true,
          removable: field.removable ?? true,
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
        {fieldTypeHasAllowClear(field.type) ? (
          <FormSwitch name="allowClear" label="允许清空" />
        ) : null}
        {fieldTypeHasListControls(field.type) ? (
          <>
            <FormSwitch name="creator" label="允许新增" />
            <FormSwitch name="sortable" label="允许排序" />
            <FormSwitch name="removable" label="允许删除" />
          </>
        ) : null}
      </ProForm>
      {fieldTypeHasOptions(field.type) ? (
        <div className="form-builder-option-list">
          <div className="form-builder-option-list-title">选项</div>
          <TextList
            value={field.options}
            onChange={(options) => updateField(id, { options })}
            placeholder="选项文案"
            creatorText="新增选项"
            creatorValue={(list) => `选项${list.length + 1}`}
          />
        </div>
      ) : null}
    </ProCard>
  );
}

export function FieldEditorList() {
  const fields = useFormBuilderStore((state) => state.fields);
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
          {ids.map((id) => (
            <SortableListItem key={id} id={id}>
              <FieldEditorItem id={id} />
            </SortableListItem>
          ))}
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
