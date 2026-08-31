import type { FormItemProps } from "antd";

export interface ChWidthProps {
  /** 控件宽度，单位为方块字符（1em）。传入后为非 block，按字符宽渲染 */
  width?: number;
  /** label 宽度，单位为方块字符（1em）。不传或 0 时按文字自动撑开 */
  labelWidth?: number;
  /** 强制占满一行，忽略 width 的 inline 行为 */
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
  const isBlock = options.block || options.width == null;
  const chStyle = {
    "--ch-label-width": chLabelWidth(options.labelWidth),
    "--ch-input-width": chVar(options.width, "100%"),
  } as unknown as NonNullable<FormItemProps["style"]>;
  return {
    ...formItemProps,
    className: [
      "ch-form-item",
      isBlock ? "ch-form-item-block" : "ch-form-item-inline",
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
