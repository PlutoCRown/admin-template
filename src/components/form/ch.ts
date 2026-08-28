import type { FormItemProps } from "antd";

export interface ChWidthProps {
  /** 控件宽度，单位为方块字符（1em）。传入后为非 block，按字符宽渲染 */
  width?: number;
  /** label 宽度，单位为方块字符（1em） */
  labelWidth?: number;
  /** 强制占满一行，忽略 width 的 inline 行为 */
  block?: boolean;
}

export function chVar(count: number | undefined, fallback: string): string {
  return count == null ? fallback : `calc(${count} * var(--form-ch))`;
}

export function chFormItemProps(
  options: ChWidthProps,
  formItemProps?: FormItemProps,
): FormItemProps {
  const isBlock = options.block || options.width == null;
  const chStyle = {
    "--ch-label-width": chVar(options.labelWidth, "max-content"),
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
  };
}
