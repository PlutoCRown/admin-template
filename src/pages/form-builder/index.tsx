import { ReloadOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { PageContainer } from "#components/page-container";
import { useFormBuilderHydration, useFormBuilderStore } from "#stores/form-builder";
import { EditorCard } from "./editor-card";
import { ExportModalHost } from "./export-modal-host";
import { PreviewCard } from "./preview-card";
import styles from "./form-builder.module.css";

export function FormBuilderPage() {
  const hydrated = useFormBuilderHydration();
  const reset = useFormBuilderStore((state) => state.reset);

  if (!hydrated) {
    return (
      <PageContainer title="表单生成器">
        <div className={styles.loading}>
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
      <div className={styles.layout}>
        <EditorCard />
        <PreviewCard />
      </div>
      <ExportModalHost />
    </PageContainer>
  );
}
