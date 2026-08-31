import { useMemo } from "react";
import { ExportOutlined } from "@ant-design/icons";
import { Button, Card, Empty } from "antd";
import {
  FormCascader,
  FormCheckbox,
  FormDate,
  FormDateTime,
  FormDigit,
  FormMoney,
  FormRadio,
  FormSegmented,
  FormSelect,
  FormSwitch,
  FormText,
  FormTextArea,
  FormTextList,
  FormTime,
  FormTreeSelect,
  ProForm,
} from "#components/form";
import { useFormBuilderStore } from "#stores/form-builder";
import {
  fieldTypeHasAllowClear,
  getFieldAllowClear,
  getFieldCreator,
  getFieldRemovable,
  getFieldSortable,
  type FormBuilderField,
} from "./schema";
import styles from "./preview-card.module.css";

const REQUIRED_RULES = [{ required: true }];

function getPreviewName(field: FormBuilderField) {
  return field.name.trim() || field.id;
}

function getPreviewLabel(field: FormBuilderField) {
  return field.label.trim() || "未命名字段";
}

function renderPreviewField(field: FormBuilderField) {
  const name = getPreviewName(field);
  const label = getPreviewLabel(field);
  const rules = field.required ? REQUIRED_RULES : undefined;
  const commonProps = {
    name,
    label,
    width: field.width,
    block: field.block,
    rules,
    ...(fieldTypeHasAllowClear(field.type)
      ? { fieldProps: { allowClear: getFieldAllowClear(field) } }
      : {}),
  };

  switch (field.type) {
    case "select":
      return (
        <FormSelect
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
          options={field.options}
        />
      );
    case "radio":
      return <FormRadio key={field.id} {...commonProps} options={field.options} />;
    case "checkbox":
      return <FormCheckbox key={field.id} {...commonProps} options={field.options} />;
    case "textArea":
      return (
        <FormTextArea
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
        />
      );
    case "digit":
      return (
        <FormDigit key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
    case "time":
      return (
        <FormTime key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
    case "date":
      return (
        <FormDate key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
    case "dateTime":
      return (
        <FormDateTime
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
        />
      );
    case "cascader":
      return (
        <FormCascader
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
          options={field.options}
        />
      );
    case "treeSelect":
      return (
        <FormTreeSelect
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
          options={field.options}
        />
      );
    case "switch":
      return <FormSwitch key={field.id} {...commonProps} />;
    case "segmented":
      return <FormSegmented key={field.id} {...commonProps} options={field.options} />;
    case "money":
      return (
        <FormMoney key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
    case "textList":
      return (
        <FormTextList
          key={field.id}
          {...commonProps}
          placeholder={field.placeholder || undefined}
          creator={getFieldCreator(field)}
          sortable={getFieldSortable(field)}
          removable={getFieldRemovable(field)}
          rules={field.required ? [{ required: true, type: "array", min: 1 } as const] : undefined}
        />
      );
    default:
      return (
        <FormText key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
  }
}

export function PreviewCard() {
  const fields = useFormBuilderStore((state) => state.fields);
  const settings = useFormBuilderStore((state) => state.settings);
  const setExportOpen = useFormBuilderStore((state) => state.setExportOpen);
  const previewFields = useMemo(() => fields.map(renderPreviewField), [fields]);

  const handleExport = () => {
    setExportOpen(true);
  };

  return (
    <Card
      title="实时预览"
      extra={
        <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
          导出
        </Button>
      }
      className={styles.card}
    >
      {fields.length > 0 ? (
        <ProForm
          submitter={false}
          layout={settings.layout}
          labelWidth={settings.labelWidth || undefined}
          labelAlign={settings.labelAlign}
          colon={settings.colon}
          className={styles.form}
        >
          {previewFields}
        </ProForm>
      ) : (
        <Empty description="请在左侧添加表单项" />
      )}
    </Card>
  );
}
