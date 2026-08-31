import { ApiOutlined, CodeOutlined, DatabaseOutlined, FileTextOutlined } from "@ant-design/icons";
import { Modal, Tabs, type TabsProps } from "antd";
import { CodeBlock } from "./code-block";
import {
  generateFormCode,
  generateFormSchema,
  generateJsonSchema,
  generatePayloadType,
  generateSamplePayload,
  type FormBuilderField,
  type FormBuilderSettings,
} from "./schema";
import styles from "./export-modal.module.css";

interface ExportModalProps {
  open: boolean;
  fields: FormBuilderField[];
  settings: FormBuilderSettings;
  onClose: () => void;
}

export function ExportModal({ open, fields, settings, onClose }: ExportModalProps) {
  const formCode = generateFormCode(fields, settings);
  const payloadType = generatePayloadType(fields);
  const jsonSchema = generateJsonSchema(fields);
  const formSchema = generateFormSchema(fields, settings);
  const samplePayload = generateSamplePayload(fields);
  const items: TabsProps["items"] = [
    {
      key: "form-code",
      label: "Form 代码",
      icon: <CodeOutlined />,
      children: <CodeBlock value={formCode} language="tsx" />,
    },
    {
      key: "payload-type",
      label: "后端数据类型",
      icon: <ApiOutlined />,
      children: <CodeBlock value={payloadType} language="typescript" />,
    },
    {
      key: "json-schema",
      label: "JSON Schema",
      icon: <DatabaseOutlined />,
      children: <CodeBlock value={jsonSchema} language="json" />,
    },
    {
      key: "form-schema",
      label: "表单 Schema",
      icon: <FileTextOutlined />,
      children: <CodeBlock value={formSchema} language="json" />,
    },
    {
      key: "sample-payload",
      label: "示例数据",
      icon: <FileTextOutlined />,
      children: <CodeBlock value={samplePayload} language="json" />,
    },
  ];

  return (
    <Modal
      title="导出表单"
      open={open}
      width="min(1280px, calc(100vw - 64px))"
      footer={null}
      destroyOnHidden
      className={styles.modal}
      onCancel={onClose}
    >
      <Tabs items={items} className={styles.tabs} />
    </Modal>
  );
}
