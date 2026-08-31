import { useMemo } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Space, Tag } from "antd";
import { useFormBuilderStore } from "#stores/form-builder";
import { EditorSettingsModal } from "./editor-settings-modal";
import { FieldEditorList } from "./field-editor-list";
import { fieldTypeHasOptions, type FormBuilderField } from "./schema";
import styles from "./editor-card.module.css";

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

export function EditorCard() {
  const fields = useFormBuilderStore((state) => state.fields);
  const addField = useFormBuilderStore((state) => state.addField);
  const warnings = useMemo(() => getSchemaWarnings(fields), [fields]);

  return (
    <Card
      title={
        <Space size={8}>
          <span>字段配置</span>
          <Tag color="blue">{fields.length} 个字段</Tag>
        </Space>
      }
      extra={
        <Space size={4}>
          <EditorSettingsModal />
          <Button type="primary" icon={<PlusOutlined />} onClick={addField}>
            新增字段
          </Button>
        </Space>
      }
      className={styles.card}
    >
      {warnings.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message="Schema 需要完善"
          description={warnings.join("；")}
          className={styles.warning}
        />
      ) : null}
      <FieldEditorList />
    </Card>
  );
}
