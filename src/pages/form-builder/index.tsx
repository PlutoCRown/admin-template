import { useState } from "react";
import { ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, InputNumber, Segmented, Space, Tag } from "antd";
import {
  FormCheckbox,
  FormDigit,
  FormRadio,
  FormSelect,
  FormText,
  FormTextArea,
  ProForm,
} from "#components/form";
import { PageContainer } from "#components/page-container";
import { ExportModal } from "./export-modal";
import { FieldEditorList } from "./field-editor-list";
import {
  getDefaultFormBuilderFields,
  getDefaultFormBuilderSettings,
  fieldTypeHasOptions,
  type FormBuilderField,
  type FormBuilderLayout,
  type FormBuilderSettings,
} from "./schema";
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

export function FormBuilderPage() {
  const [fields, setFields] = useState<FormBuilderField[]>(getDefaultFormBuilderFields);
  const [settings, setSettings] = useState<FormBuilderSettings>(getDefaultFormBuilderSettings);
  const [exportOpen, setExportOpen] = useState(false);
  const warnings = getSchemaWarnings(fields);
  const previewFields = fields.map(renderPreviewField);

  const handleReset = () => {
    setFields(getDefaultFormBuilderFields());
    setSettings(getDefaultFormBuilderSettings());
  };

  const handleLayoutChange = (layout: string | number) => {
    setSettings((current) => ({ ...current, layout: layout as FormBuilderLayout }));
  };

  const handleLabelWidthChange = (labelWidth: number | null) => {
    if (labelWidth !== null) {
      setSettings((current) => ({ ...current, labelWidth }));
    }
  };

  const handleLabelAlignChange = (labelAlign: string | number) => {
    setSettings((current) => ({ ...current, labelAlign: labelAlign as "left" | "right" }));
  };

  const handleOpenExport = () => {
    setExportOpen(true);
  };

  const handleCloseExport = () => {
    setExportOpen(false);
  };

  const isVertical = settings.layout === "vertical";
  const editorActions = (
    <Space size="middle" wrap className="form-builder-editor-settings">
      <label className="form-builder-setting-control">
        <span>表单布局</span>
        <Segmented options={LAYOUT_OPTIONS} value={settings.layout} onChange={handleLayoutChange} />
      </label>
      <label className="form-builder-setting-control">
        <span>默认标签宽度</span>
        <InputNumber
          min={1}
          max={16}
          value={settings.labelWidth}
          onChange={handleLabelWidthChange}
        />
      </label>
      <label
        className={[
          "form-builder-setting-control",
          isVertical ? "form-builder-setting-control-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>标签对齐</span>
        <Segmented
          options={LABEL_ALIGN_OPTIONS}
          value={settings.labelAlign}
          disabled={isVertical}
          onChange={handleLabelAlignChange}
        />
      </label>
      <Button icon={<ReloadOutlined />} onClick={handleReset}>
        恢复示例
      </Button>
    </Space>
  );

  const previewActions = (
    <Button type="primary" icon={<ExportOutlined />} onClick={handleOpenExport}>
      导出
    </Button>
  );

  return (
    <PageContainer
      title="表单生成器"
      subTitle="配置字段 Schema，实时生成表单、前端代码和后端数据结构"
    >
      <div className="form-builder-layout">
        <Card title="字段配置" extra={editorActions} className="form-builder-editor-card">
          <div className="form-builder-summary">
            <Space size={[4, 4]} wrap>
              <Tag color="blue">{fields.length} 个字段</Tag>
              <Tag>支持文本、多行文本、数字、下拉、单选和多选</Tag>
              <Tag>拖动卡片左上角手柄调整顺序</Tag>
            </Space>
          </div>
          {warnings.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message="Schema 需要完善"
              description={warnings.join("；")}
              className="form-builder-warning"
            />
          ) : null}
          <FieldEditorList fields={fields} onChange={setFields} />
        </Card>

        <Card title="实时预览" extra={previewActions} className="form-builder-preview-card">
          {fields.length > 0 ? (
            <ProForm
              submitter={false}
              layout={settings.layout}
              labelWidth={settings.labelWidth}
              labelAlign={settings.labelAlign}
              className="form-builder-preview-form"
            >
              {previewFields}
            </ProForm>
          ) : (
            <Empty description="请在左侧添加表单项" />
          )}
        </Card>
      </div>

      <ExportModal
        open={exportOpen}
        fields={fields}
        settings={settings}
        onClose={handleCloseExport}
      />
    </PageContainer>
  );
}
