import type { ReactElement } from "react";
import {
  ProForm as AntProForm,
  type ProFormItemProps,
  type ProFormProps,
} from "@ant-design/pro-components";
import { chFormItemProps, type ChWidthProps } from "./ch";
import "./ch-form.css";

export { chFormItemProps, type ChWidthProps } from "./ch";
export { FormDigit, FormSelect, FormText, FormTextArea } from "./fields";

const BaseProForm = AntProForm as unknown as <T extends Record<string, any>>(
  props: ProFormProps<T>,
) => ReactElement;

export function ProForm<T extends Record<string, any> = Record<string, any>>(
  props: ProFormProps<T>,
) {
  return (
    <BaseProForm<T>
      layout="horizontal"
      grid={false}
      labelAlign="right"
      labelCol={{ flex: "0 0 auto" }}
      wrapperCol={{ flex: "none" }}
      {...props}
      className={["ch-form", props.className].filter(Boolean).join(" ")}
    />
  );
}

export function FormItem(props: ProFormItemProps & ChWidthProps) {
  const { width, labelWidth, block, className, style, ...rest } = props;
  const ch = chFormItemProps({ width, labelWidth, block }, { className, style });
  return <AntProForm.Item {...rest} {...ch} />;
}
