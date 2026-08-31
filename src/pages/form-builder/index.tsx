import { useMemo } from "react";
import { ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Form, Spin } from "antd";
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
  FormTime,
  FormTreeSelect,
  ProForm,
} from "#components/form";
import { PageContainer } from "#components/page-container";
import { useFormBuilderHydration, useFormBuilderStore } from "#stores/form-builder";
import { ExportModal } from "./export-modal";
import { FieldEditorList } from "./field-editor-list";
import { fieldTypeHasOptions, type FormBuilderField, type FormBuilderSettings } from "./schema";
import "./form-builder.css";

const REQUIRED_RULES = [{ required: true }];
const LAYOUT_OPTIONS = [
  { label: "水平", value: "horizontal" },
  { label: "垂直", value: "vertical" },
];
const LABEL_ALIGN_OPTIONS = [
  { label: "左对齐", value: "left" },
  { label: "右对齐", value: "right" },
];

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
    default:
      return (
        <FormText key={field.id} {...commonProps} placeholder={field.placeholder || undefined} />
      );
  }
}

function getSchemaWarnings(fields: FormBuilderField[]) {
  const warnings: string[] = [];
  const names = new Set<string>();
  fields.forEach((field, index) => {
    const position = index + 1;
    const name = field.name.trim();
    if (!name) {
      warnings.push(`第 ${position} 项缺少字段名`);
    } else if (names.has(name)) {
      warnings.push(`字段名 ${name} 重复`);
    } else {
      names.add(name);
    }
    if (!field.label.trim()) {
      warnings.push(`第 ${position} 项缺少显示名称`);
    }
    if (fieldTypeHasOptions(field.type) && field.options.length === 0) {
      warnings.push(`${field.label || `第 ${position} 项`}没有可选项`);
    }
  });
  return warnings;
}

function EditorSettingsForm() {
  const epoch = useFormBuilderStore((state) => state.epoch);
  const layout = useFormBuilderStore((state) => state.settings.layout);
  const patchSettings = useFormBuilderStore((state) => state.patchSettings);
  const settings = useFormBuilderStore.getState().settings;
  const [form] = Form.useForm<FormBuilderSettings>();
  const isVertical = layout === "vertical";

  return (
    <ProForm<FormBuilderSettings>
      key={epoch}
      size="small"
      form={form}
      submitter={false}
      colon={false}
      preserve={false}
      labelWidth={6}
      className="form-builder-editor-settings"
      style={{ height: "auto", overflow: "visible" }}
      initialValues={{
        layout: settings.layout,
        labelAlign: settings.labelAlign,
        colon: settings.colon,
        labelWidth: settings.labelWidth > 0 ? settings.labelWidth : undefined,
      }}
      onValuesChange={(changed) => {
        const patch: Partial<FormBuilderSettings> = { ...changed };
        if ("labelWidth" in changed) {
          patch.labelWidth = changed.labelWidth ?? 0;
        }
        patchSettings(patch);
      }}
    >
      <FormSegmented name="layout" label="表单布局" options={LAYOUT_OPTIONS} />
      <FormDigit name="labelWidth" label="默认标签宽度" min={0} max={16} placeholder="自动" />
      <FormSegmented
        name="labelAlign"
        label="标签对齐"
        options={LABEL_ALIGN_OPTIONS}
        disabled={isVertical}
      />
      <FormSwitch name="colon" label="标签冒号" disabled={isVertical} />
    </ProForm>
  );
}

function EditorCard() {
  const fields = useFormBuilderStore((state) => state.fields);
  const warnings = useMemo(() => getSchemaWarnings(fields), [fields]);

  return (
    <Card title="字段配置" extra={<EditorSettingsForm />} className="form-builder-editor-card">
      {warnings.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message="Schema 需要完善"
          description={warnings.join("；")}
          className="form-builder-warning"
        />
      ) : null}
      <FieldEditorList />
    </Card>
  );
}

function PreviewCard() {
  const fields = useFormBuilderStore((state) => state.fields);
  const settings = useFormBuilderStore((state) => state.settings);
  const setExportOpen = useFormBuilderStore((state) => state.setExportOpen);
  const previewFields = useMemo(() => fields.map(renderPreviewField), [fields]);

  return (
    <Card
      title="实时预览"
      extra={
        <Button type="primary" icon={<ExportOutlined />} onClick={() => setExportOpen(true)}>
          导出
        </Button>
      }
      className="form-builder-preview-card"
    >
      {fields.length > 0 ? (
        <ProForm
          submitter={false}
          layout={settings.layout}
          labelWidth={settings.labelWidth || undefined}
          labelAlign={settings.labelAlign}
          colon={settings.colon}
          className="form-builder-preview-form"
        >
          {previewFields}
        </ProForm>
      ) : (
        <Empty description="请在左侧添加表单项" />
      )}
    </Card>
  );
}

function ExportModalHost() {
  const exportOpen = useFormBuilderStore((state) => state.exportOpen);
  const fields = useFormBuilderStore((state) => state.fields);
  const settings = useFormBuilderStore((state) => state.settings);
  const setExportOpen = useFormBuilderStore((state) => state.setExportOpen);

  if (!exportOpen) {
    return null;
  }

  return (
    <ExportModal open fields={fields} settings={settings} onClose={() => setExportOpen(false)} />
  );
}

export function FormBuilderPage() {
  const hydrated = useFormBuilderHydration();
  const reset = useFormBuilderStore((state) => state.reset);

  if (!hydrated) {
    return (
      <PageContainer title="表单生成器">
        <div style={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <Spin />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="表单生成器"
      subTitle={
        <Button icon={<ReloadOutlined />} onClick={reset}>
          重置示例
        </Button>
      }
    >
      <div className="form-builder-layout">
        <EditorCard />
        <PreviewCard />
      </div>
      <ExportModalHost />
    </PageContainer>
  );
}
