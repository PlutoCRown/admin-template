import type { FormItemProps } from "antd";

export interface ChWidthProps {
  /** 控件宽度，单位为方块字符（1em）。不传则按内容宽度 */
  width?: number;
  /** label 宽度，单位为方块字符（1em）。不传或 0 时按文字自动撑开 */
  labelWidth?: number;
  /** 表单项独占一行；控件本身是否拉满取决于类型（输入类拉满，switch/segmented 仍按内容） */
  block?: boolean;
}

function chEm(count: number) {
  return `calc(${count} * var(--form-ch))`;
}

export function chFormItemProps(
  options: ChWidthProps,
  formItemProps?: FormItemProps,
): FormItemProps {
  const isBlock = Boolean(options.block);
  const hasWidth = options.width != null;
  const chStyle = {
    ...(options.labelWidth != null
      ? {
          "--ch-label-width": options.labelWidth === 0 ? "max-content" : chEm(options.labelWidth),
        }
      : {}),
    ...(options.width != null ? { "--ch-input-width": chEm(options.width) } : {}),
  } as unknown as NonNullable<FormItemProps["style"]>;
  return {
    ...formItemProps,
    className: [
      "ch-form-item",
      isBlock ? "ch-form-item-block" : "ch-form-item-inline",
      !isBlock && !hasWidth ? "ch-form-item-auto" : "",
      formItemProps?.className,
    ]
      .filter(Boolean)
      .join(" "),
    style: {
      ...formItemProps?.style,
      ...chStyle,
    },
    wrapperCol: {
      flex: isBlock ? "1 1 0" : "1 1 auto",
      ...formItemProps?.wrapperCol,
    },
  };
}
