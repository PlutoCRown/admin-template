import { CloseOutlined } from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";
import { Button, Form, Popconfirm } from "antd";
import { FormDigit, FormSelect, FormSwitch, FormText, ProForm, TextList } from "#components/form";
import { useFormBuilderStore } from "#stores/form-builder";
import { DragHandleButton } from "./drag-handle";
import {
  FIELD_TYPE_OPTIONS,
  fieldTypeHasAllowClear,
  fieldTypeHasListControls,
  fieldTypeHasOptions,
  fieldTypeHasPlaceholder,
  fieldTypeHasWidth,
  type FormBuilderField,
} from "./schema";
import styles from "./field-editor-item.module.css";

interface FieldEditorItemProps {
  id: string;
  overlay?: boolean;
}

function getCreatorValue(list: string[]) {
  return `选项${list.length + 1}`;
}

export function FieldEditorItem({ id, overlay = false }: FieldEditorItemProps) {
  const epoch = useFormBuilderStore((state) => state.epoch);
  const field = useFormBuilderStore((state) => state.fields.find((item) => item.id === id));
  const updateField = useFormBuilderStore((state) => state.updateField);
  const changeFieldType = useFormBuilderStore((state) => state.changeFieldType);
  const removeField = useFormBuilderStore((state) => state.removeField);
  const [form] = Form.useForm();

  if (!field) {
    return null;
  }

  const handleRemove = () => {
    removeField(id);
  };
  const handleValuesChange = (changed: Partial<FormBuilderField>) => {
    if (changed.type !== undefined) {
      changeFieldType(id, changed.type);
      return;
    }
    if ("width" in changed && changed.width == null) {
      return;
    }
    updateField(id, changed);
  };
  const handleOptionsChange = (options: string[]) => {
    updateField(id, { options });
  };

  return (
    <ProCard
      size="small"
      className={styles.card}
      title={
        <DragHandleButton overlay={overlay} aria-label={overlay ? undefined : "拖动调整顺序"} />
      }
      extra={
        <Popconfirm title="删除这个表单项？" onConfirm={handleRemove}>
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
        className={styles.form}
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
        onValuesChange={handleValuesChange}
      >
        <FormText name="label" label="显示名称" width={10} placeholder="显示名称" />
        <FormText
          name="name"
          label="字段名"
          width={10}
          placeholder="fieldName"
          fieldProps={{ className: styles.fieldName }}
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
        <div className={styles.optionList}>
          <div className={styles.optionListTitle}>选项</div>
          <TextList
            value={field.options}
            onChange={handleOptionsChange}
            placeholder="选项文案"
            creatorText="新增选项"
            creatorValue={getCreatorValue}
          />
        </div>
      ) : null}
    </ProCard>
  );
}
