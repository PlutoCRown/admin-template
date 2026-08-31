import { SlidersOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { Button } from "antd";
import { FormDigit, FormSegmented, FormSwitch } from "#components/form";
import { useFormBuilderStore } from "#stores/form-builder";
import { type FormBuilderSettings } from "./schema";
import styles from "./editor-settings-modal.module.css";

const LAYOUT_OPTIONS = [
  { label: "水平", value: "horizontal" },
  { label: "垂直", value: "vertical" },
];
const LABEL_ALIGN_OPTIONS = [
  { label: "左对齐", value: "left" },
  { label: "右对齐", value: "right" },
];

export function EditorSettingsModal() {
  const epoch = useFormBuilderStore((state) => state.epoch);
  const settings = useFormBuilderStore((state) => state.settings);
  const patchSettings = useFormBuilderStore((state) => state.patchSettings);
  const isVertical = settings.layout === "vertical";

  const handleValuesChange = (changed: Partial<FormBuilderSettings>) => {
    const patch = { ...changed };
    if ("labelWidth" in changed) {
      patch.labelWidth = changed.labelWidth ?? 0;
    }
    patchSettings(patch);
  };

  return (
    <ModalForm<FormBuilderSettings>
      key={epoch}
      title="表单配置"
      layout="vertical"
      grid={false}
      colon={false}
      preserve={false}
      submitter={false}
      className={`ch-form ch-form-horizontal ${styles.form}`}
      trigger={<Button icon={<SlidersOutlined />} aria-label="表单配置" />}
      modalProps={{ destroyOnHidden: true, width: 520 }}
      initialValues={{
        layout: settings.layout,
        labelAlign: settings.labelAlign,
        colon: settings.colon,
        labelWidth: settings.labelWidth > 0 ? settings.labelWidth : undefined,
      }}
      onValuesChange={handleValuesChange}
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
    </ModalForm>
  );
}
