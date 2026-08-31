import type { CSSProperties, ReactElement } from "react";
import {
  ProForm as AntProForm,
  type ProFormItemProps,
  type ProFormProps,
} from "@ant-design/pro-components";
import { chFormItemProps, type ChWidthProps } from "./ch";
import "./ch-form.css";

export { chFormItemProps, type ChWidthProps } from "./ch";
export {
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
} from "./fields";

export interface ChProFormProps<T extends Record<string, any>> extends ProFormProps<T> {
  /** 表单内所有未单独声明 labelWidth 的表单项默认标签宽度，单位为方块字符（1em）。不传或 0 时按文字自动撑开 */
  labelWidth?: number;
}

const BaseProForm = AntProForm as unknown as <T extends Record<string, any>>(
  props: ProFormProps<T>,
) => ReactElement;

export function ProForm<T extends Record<string, any> = Record<string, any>>(
  props: ChProFormProps<T>,
) {
  const { labelWidth, style, layout = "horizontal", className, ...rest } = props;
  const chStyle = {
    width: "100%",
    height: "100%",
    ...(labelWidth
      ? { "--ch-default-label-width": `calc(${labelWidth} * var(--form-ch))` }
      : {}),
    ...style,
  } as CSSProperties;
  return (
    <BaseProForm<T>
      layout={layout}
      grid={false}
      labelAlign="right"
      labelCol={{ flex: "0 0 auto" }}
      wrapperCol={{ flex: "none" }}
      {...rest}
      className={["ch-form", `ch-form-${layout}`, className].filter(Boolean).join(" ")}
      style={chStyle}
    />
  );
}

export function FormItem(props: ProFormItemProps & ChWidthProps) {
  const { width, labelWidth, block, className, style, ...rest } = props;
  const ch = chFormItemProps({ width, labelWidth, block }, { className, style });
  return <AntProForm.Item {...rest} {...ch} />;
}
