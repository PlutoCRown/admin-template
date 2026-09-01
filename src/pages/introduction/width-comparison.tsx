import { useState } from "react";
import {
  ProForm as AntProForm,
  ProFormDigit as AntProFormDigit,
  ProFormSelect as AntProFormSelect,
  ProFormText as AntProFormText,
  ProFormTextArea as AntProFormTextArea,
  ProFormTimePicker as AntProFormTimePicker,
} from "@ant-design/pro-components";
import { Segmented, Switch, Tag } from "antd";
import { FormDigit, FormSelect, FormText, FormTextArea, FormTime, ProForm } from "#components/form";
import { ExpandableCode } from "./expandable-code";
import styles from "./introduction.module.css";

type AlignmentMode = "default" | "forced";
type FormLayout = "horizontal" | "vertical";

const alignmentOptions = [
  { label: "最少参数", value: "default" },
  { label: "尝试强制对齐", value: "forced" },
];

const nativeDefaultCode = `<ProForm layout="horizontal" submitter={false}>
  <ProFormText name="title" label="输入框" />
  <ProFormSelect name="type" label="下拉选择" options={options} />
  <ProFormDigit name="count" label="数字输入框" />
  <ProFormTextArea name="remark" label="文本区域" />
  <ProFormTimePicker name="time" label="时间选择器" />
</ProForm>`;

const nativeForcedCode = `<ProForm layout="horizontal" submitter={false}>
  <ProFormText
    name="title"
    label="输入框"
    fieldProps={{ style: { width: "100%" } }}
  />
  <ProFormSelect
    name="type"
    label="下拉选择"
    options={options}
    fieldProps={{ style: { width: "100%" } }}
  />
  <ProFormDigit
    name="count"
    label="数字输入框"
    fieldProps={{ style: { width: "100%" } }}
  />
  <ProFormTextArea
    name="remark"
    label="文本区域"
    fieldProps={{ style: { width: "100%" } }}
  />
  <ProFormTimePicker
    name="time"
    label="时间选择器"
    fieldProps={{ style: { width: "100%" } }}
  />
</ProForm>`;

const wrappedCode = `<ProForm layout="horizontal" submitter={false}>
  <FormText name="title" label="输入框" block />
  <FormSelect name="type" label="下拉选择" options={options} block />
  <FormDigit name="count" label="数字输入框" block />
  <FormTextArea name="remark" label="文本区域" block />
  <FormTime name="time" label="时间选择器" block />
</ProForm>`;

const selectOptions = ["公告", "活动", "帮助文档"];
const fullWidthFieldProps = { style: { width: "100%" } };

function getLayoutCode(code: string, layout: FormLayout) {
  return code.replace('layout="horizontal"', `layout="${layout}"`);
}

export function WidthComparison() {
  const [mode, setMode] = useState<AlignmentMode>("default");
  const [layout, setLayout] = useState<FormLayout>("horizontal");
  const isForced = mode === "forced";
  const nativeCode = getLayoutCode(isForced ? nativeForcedCode : nativeDefaultCode, layout);
  const adminTemplateCode = getLayoutCode(wrappedCode, layout);

  const handleModeChange = (value: string | number) => {
    setMode(value as AlignmentMode);
  };

  const handleLayoutChange = (vertical: boolean) => {
    setLayout(vertical ? "vertical" : "horizontal");
  };

  return (
    <section className={styles.comparisonBlock} aria-labelledby="field-width-title">
      <div className={styles.comparisonToolbar}>
        <div>
          <h3 id="field-width-title">同一组字段，两套宽度语义</h3>
          <p>
            先看最少参数，再切换到“尝试强制对齐”：左侧需要逐个找到并设置控件宽度，右侧仍然只有
            <code> block</code>。
          </p>
        </div>
        <div className={styles.comparisonControls}>
          <Segmented options={alignmentOptions} value={mode} onChange={handleModeChange} />
          <label className={styles.layoutToggle}>
            <span>表单布局</span>
            <Switch
              checked={layout === "vertical"}
              checkedChildren="纵向"
              unCheckedChildren="横向"
              onChange={handleLayoutChange}
            />
          </label>
        </div>
      </div>

      <div className={styles.comparisonColumns}>
        <article className={styles.comparisonPanel}>
          <header className={styles.panelHeader}>
            <strong>Ant Design Pro</strong>
            <Tag>{isForced ? "重复传入 width: 100%" : "默认宽度"}</Tag>
          </header>
          <AntProForm layout={layout} submitter={false}>
            <AntProFormText
              name="nativeTitle"
              label="输入框"
              fieldProps={isForced ? fullWidthFieldProps : undefined}
            />
            <AntProFormSelect
              name="nativeType"
              label="下拉选择"
              options={selectOptions}
              fieldProps={isForced ? fullWidthFieldProps : undefined}
            />
            <AntProFormDigit
              name="nativeCount"
              label="数字输入框"
              fieldProps={isForced ? fullWidthFieldProps : undefined}
            />
            <AntProFormTextArea
              name="nativeRemark"
              label="文本区域"
              fieldProps={isForced ? fullWidthFieldProps : undefined}
            />
            <AntProFormTimePicker
              name="nativeTime"
              label="时间选择器"
              fieldProps={isForced ? fullWidthFieldProps : undefined}
            />
          </AntProForm>
          <p className={styles.panelNote}>
            {isForced
              ? "这一组可以逐项补齐，但复合控件换一层 DOM 后，样式落点也可能要跟着改。"
              : "文本框、选择器、文本域和时间选择器各自遵循组件默认宽度，视觉边界并不统一。"}
          </p>
        </article>

        <article className={`${styles.comparisonPanel} ${styles.ourPanel}`}>
          <header className={styles.panelHeader}>
            <strong>Admin Template</strong>
            <Tag color="blue">统一 block 语义</Tag>
          </header>
          <ProForm layout={layout} submitter={false} className={styles.wrappedFieldForm}>
            <FormText name="wrappedTitle" label="输入框" block />
            <FormSelect name="wrappedType" label="下拉选择" options={selectOptions} block />
            <FormDigit name="wrappedCount" label="数字输入框" block />
            <FormTextArea name="wrappedRemark" label="文本区域" block />
            <FormTime name="wrappedTime" label="时间选择器" block />
          </ProForm>
        </article>
      </div>
      <div className={styles.comparisonCodeRow}>
        <ExpandableCode code={nativeCode} title="展开 Ant Design Pro 完整代码" />
        <ExpandableCode code={adminTemplateCode} title="展开 Admin Template 完整代码" />
      </div>
    </section>
  );
}
