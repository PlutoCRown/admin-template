import { type ReactNode } from "react";
import type { DateFormat, LargeNumberFormat } from "#stores/global-config";
import {
  formatChineseNumber,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatWesternNumber,
} from "#utils/format";
import { FormatCell } from "./format-cell";

export type ProColumnRenderer =
  | "dateTime"
  | "largeNumber"
  | { type: "dateTime" }
  | { type: "largeNumber"; digits?: number };

export interface ProTableFormats {
  largeNumber: LargeNumberFormat;
  dateTime: DateFormat;
}

export function getRendererType(renderer: ProColumnRenderer) {
  return typeof renderer === "string" ? renderer : renderer.type;
}

function renderRawValue(value: unknown) {
  if (value == null || value === "") {
    return "-";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "bigint":
    case "boolean":
      return `${value}`;
    default:
      return "-";
  }
}

export function renderFormattedValue(
  value: unknown,
  renderer: ProColumnRenderer,
  formats: ProTableFormats,
): ReactNode {
  const type = getRendererType(renderer);
  if (type === "dateTime") {
    if (formats.dateTime === "none") {
      return renderRawValue(value);
    }
    const original = formatDateTime(value);
    const text = formats.dateTime === "date" ? formatDate(value) : formatRelativeTime(value);
    return <FormatCell text={text} original={original} />;
  }
  const digits =
    typeof renderer === "object" && renderer.type === "largeNumber" ? renderer.digits : undefined;
  if (formats.largeNumber === "none") {
    return renderRawValue(value);
  }
  const text =
    formats.largeNumber === "western"
      ? formatWesternNumber(value, digits)
      : formatChineseNumber(value, digits);
  return <FormatCell text={text} original={formatNumber(value)} />;
}
