import { Tooltip } from "antd";

interface FormatCellProps {
  text: string;
  original: string;
}

export function FormatCell({ text, original }: FormatCellProps) {
  if (!text) {
    return "-";
  }
  if (!original || original === text) {
    return text;
  }
  return (
    <Tooltip title={original}>
      <span>{text}</span>
    </Tooltip>
  );
}
