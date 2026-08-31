import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const DATE_TIME_TEMPLATE = "YYYY-MM-DD HH:mm:ss";

function toDayjs(value: unknown) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    return null;
  }
  const date = dayjs(value);
  return date.isValid() ? date : null;
}

export function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const next = Number(value);
    return Number.isFinite(next) ? next : undefined;
  }
  return undefined;
}

function trimZeros(value: string) {
  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

interface CompactUnit {
  value: number;
  label: string;
}

const WESTERN_UNITS: CompactUnit[] = [
  { value: 1e3, label: "K" },
  { value: 1e6, label: "M" },
  { value: 1e9, label: "B" },
  { value: 1e12, label: "T" },
];

const CHINESE_UNITS: CompactUnit[] = [
  { value: 1e4, label: "万" },
  { value: 1e8, label: "亿" },
  { value: 1e12, label: "万亿" },
];

function formatCompactNumber(value: number, units: CompactUnit[], digits: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  let unitIndex = -1;
  for (const [index, unit] of units.entries()) {
    if (abs < unit.value) {
      break;
    }
    unitIndex = index;
  }
  if (unitIndex < 0) {
    return `${sign}${abs.toLocaleString("zh-CN")}`;
  }

  let unit = units[unitIndex];
  let scaled = abs / unit.value;
  const nextUnit = units[unitIndex + 1];
  if (nextUnit && Number(scaled.toFixed(digits)) >= nextUnit.value / unit.value) {
    unitIndex += 1;
    unit = units[unitIndex]!;
    scaled = abs / unit.value;
  }
  return `${sign}${trimZeros(scaled.toFixed(digits))}${unit.label}`;
}

/** 格式化为 `YYYY-MM-DD HH:mm:ss` */
export function formatDateTime(value: unknown, template = DATE_TIME_TEMPLATE) {
  return toDayjs(value)?.format(template) ?? "";
}

/** 仅保留日期，如 `2026-08-31` */
export function formatDate(value: unknown) {
  return formatDateTime(value, "YYYY-MM-DD");
}

/** 格式化为相对时间，如「3 小时前」 */
export function formatRelativeTime(value: unknown) {
  return toDayjs(value)?.fromNow() ?? "";
}

/** 按中文习惯加千分位，如 `12,345,678` */
export function formatNumber(value: unknown) {
  const amount = toFiniteNumber(value);
  return amount == null ? "" : amount.toLocaleString("zh-CN");
}

/** 大数按英文习惯格式化为 K / M / B / T，如 `12.8K`、`3.5B` */
export function formatWesternNumber(value: unknown, digits = 2) {
  const amount = toFiniteNumber(value);
  return amount == null ? "" : formatCompactNumber(amount, WESTERN_UNITS, digits);
}

/** 大数按中文习惯格式化为万 / 亿 / 万亿，如 `1.2万`、`3.5亿` */
export function formatChineseNumber(value: unknown, digits = 2) {
  const amount = toFiniteNumber(value);
  return amount == null ? "" : formatCompactNumber(amount, CHINESE_UNITS, digits);
}
