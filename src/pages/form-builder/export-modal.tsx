import { useMemo, useState } from "react";
import {
  ApiOutlined,
  CodeOutlined,
  CopyOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { App, Button, Modal, Tabs, type TabsProps } from "antd";
import { highlightCode } from "./highlight";
import {
  generateFormCode,
  generateFormSchema,
  generateJsonSchema,
  generatePayloadType,
  generateSamplePayload,
  type FormBuilderField,
  type FormBuilderSettings,
} from "./schema";

interface ExportModalProps {
  open: boolean;
  fields: FormBuilderField[];
  settings: FormBuilderSettings;
  onClose: () => void;
}

interface CodeBlockProps {
  value: string;
  language: string;
}

function CodeBlock({ value, language }: CodeBlockProps) {
  const { message } = App.useApp();
  const [copying, setCopying] = useState(false);
  const highlighted = useMemo(() => highlightCode(value, language), [language, value]);

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(value);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动选择代码");
    }
    setCopying(false);
  };

  return (
    <div className="form-builder-code-block">
      <div className="form-builder-code-toolbar">
        <span>{language}</span>
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          loading={copying}
          onClick={handleCopy}
        >
          复制
        </Button>
      </div>
      <pre>
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
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
      className="form-builder-export-modal"
      onCancel={onClose}
    >
      <Tabs items={items} className="form-builder-export-tabs" />
    </Modal>
  );
}
