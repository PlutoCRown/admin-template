import {
  createContext,
  useContext,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DeleteOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProCard, ProList } from "@ant-design/pro-components";
import { Button, Input, InputNumber, Popconfirm, Select, Switch } from "antd";
import {
  FIELD_TYPE_OPTIONS,
  applyFieldTypeDefaults,
  createFormBuilderField,
  fieldTypeHasOptions,
  fieldTypeHasPlaceholder,
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

interface OptionRow {
  id: string;
  value: string;
  index: number;
}

interface SortableListItemProps {
  id: string;
  children: ReactNode;
}

function OptionEditorList({ options, onChange }: OptionEditorListProps) {
  const dataSource: OptionRow[] = options.map((value, index) => ({
    id: `option-${index}`,
    value,
    index,
  }));

  const handleValueChange = (index: number, value: string) => {
    onChange(options.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };
  const handleRemove = (index: number) => {
    onChange(options.filter((_, itemIndex) => itemIndex !== index));
  };
  const handleAdd = () => {
    onChange([...options, `选项${options.length + 1}`]);
  };
  const renderToolbar = () => [
    <Button key="add" size="small" type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
      新增选项
    </Button>,
  ];
  const renderItem = (item: OptionRow) => (
    <div className="form-builder-option-item">
      <Input
        value={item.value}
        onChange={(event) => handleValueChange(item.index, event.target.value)}
        placeholder="选项文案"
      />
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        aria-label={`删除选项 ${item.value || item.index + 1}`}
        onClick={() => handleRemove(item.index)}
      />
    </div>
  );

  return (
    <ProList<OptionRow>
      rowKey="id"
      headerTitle="选项"
      search={false}
      options={false}
      pagination={false}
      split={false}
      dataSource={dataSource}
      columns={[{ key: "editor", listSlot: "content" }]}
      itemRender={renderItem}
      toolBarRender={renderToolbar}
      cardProps={{ ghost: true }}
      className="form-builder-option-list"
    />
  );
}

const DragHandleContext = createContext<ReactNode>(null);

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
  } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 2 : undefined,
    boxShadow: isDragging ? "0 10px 28px rgb(0 0 0 / 16%)" : undefined,
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
          <Select value={field.type} options={FIELD_TYPE_OPTIONS} onChange={handleTypeChange} />
        </label>
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
      <Button type="text" danger icon={<DeleteOutlined />} aria-label={`删除 ${field.label}`} />
    </Popconfirm>
  );
}

function renderSortableItem(
  field: FormBuilderField,
  onUpdate: FieldEditorItemProps["onUpdate"],
  onRemove: FieldEditorItemProps["onRemove"],
) {
  return (
    <SortableListItem id={field.id}>
      <FieldEditorItem field={field} onUpdate={onUpdate} onRemove={onRemove} />
    </SortableListItem>
  );
}

export function FieldEditorList({ fields, onChange }: FieldEditorListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const ids = fields.map((field) => field.id);

  const handleUpdate = (id: string, patch: Partial<FormBuilderField>) => {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };
  const handleRemove = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };
  const handleAdd = () => {
    onChange([...fields, createFormBuilderField()]);
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }
    const fromIndex = fields.findIndex((field) => field.id === active.id);
    const toIndex = fields.findIndex((field) => field.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) {
      onChange(arrayMove(fields, fromIndex, toIndex));
    }
  };
  const renderToolbar = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
      新增字段
    </Button>,
  ];
  const renderItem = (field: FormBuilderField) =>
    renderSortableItem(field, handleUpdate, handleRemove);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ProList<FormBuilderField>
          rowKey="id"
          headerTitle="字段列表"
          search={false}
          options={false}
          pagination={false}
          split={false}
          dataSource={fields}
          columns={[{ key: "editor", listSlot: "content" }]}
          itemRender={renderItem}
          toolBarRender={renderToolbar}
          className="form-builder-field-list"
        />
      </SortableContext>
    </DndContext>
  );
}
