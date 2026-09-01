import { Form, Input, Button, Tag } from "antd";
import { FormText, ProForm } from "#components/form";
import styles from "./introduction.module.css";

function handleNativeFinish() {
  return undefined;
}

async function handleWrappedFinish() {
  return true;
}

export function InlineFormComparison() {
  return (
    <div className={styles.inlineComparison}>
      <div className={styles.inlinePanel}>
        <div className={styles.inlinePanelTitle}>
          <strong>默认 Form.Item</strong>
          <Tag>margin-bottom</Tag>
        </div>
        <div className={styles.centerGuide} aria-hidden="true" />
        <Form className={styles.nativeInlineForm} onFinish={handleNativeFinish}>
          <Form.Item name="nativeKeyword" label="关键字">
            <Input placeholder="回车也能提交" />
          </Form.Item>
          <Button htmlType="submit">查询</Button>
        </Form>
      </div>
      <div className={`${styles.inlinePanel} ${styles.ourInlinePanel}`}>
        <div className={styles.inlinePanelTitle}>
          <strong>ch-form</strong>
          <Tag color="blue">gap + align-items</Tag>
        </div>
        <div className={styles.centerGuide} aria-hidden="true" />
        <ProForm
          submitter={false}
          onFinish={handleWrappedFinish}
          className={styles.wrappedInlineForm}
        >
          <FormText name="wrappedKeyword" label="关键字" width={12} />
          <Button htmlType="submit">查询</Button>
        </ProForm>
      </div>
    </div>
  );
}
