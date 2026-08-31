import type { FormItemProps } from "antd";

export interface ChWidthProps {
  /** 控件宽度，单位为方块字符（1em）。不传则按内容宽度 */
  width?: number;
  /** label 宽度，单位为方块字符（1em）。不传或 0 时按文字自动撑开 */
  labelWidth?: number;
  /** 表单项独占一行；控件本身是否拉满取决于类型（输入类拉满，switch/segmented 仍按内容） */
  block?: boolean;
}

export function chVar(count: number | undefined, fallback: string): string {
  return count == null ? fallback : `calc(${count} * var(--form-ch))`;
}

function chLabelWidth(count: number | undefined): string {
  if (count === 0) {
    return "max-content";
  }
  return chVar(count, "var(--ch-default-label-width, max-content)");
}

export function chFormItemProps(
  options: ChWidthProps,
  formItemProps?: FormItemProps,
): FormItemProps {
  const isBlock = Boolean(options.block);
  const hasWidth = options.width != null;
  const chStyle = {
    "--ch-label-width": chLabelWidth(options.labelWidth),
    // 未指定 width 时按内容宽度，避免 switch/segmented 等被拉满
    "--ch-input-width": hasWidth ? chVar(options.width, "100%") : "max-content",
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
