import { Image } from "antd";
import type { CSSProperties } from "react";

export interface ProColumnImageOptions {
  padding?: number;
  radius?: number;
  objectFit?: CSSProperties["objectFit"];
  objectPosition?: CSSProperties["objectPosition"];
  preview?: boolean;
  fallback?: string;
}

interface ImageCellProps extends ProColumnImageOptions {
  src: string;
}

function getImageCellStyle({
  padding,
  radius,
  objectFit,
  objectPosition,
}: ProColumnImageOptions): CSSProperties | undefined {
  const style: Record<string, string | number> = {};
  if (padding != null && padding > 0) {
    style.padding = padding;
  }
  if (radius != null && radius > 0) {
    style["--admin-pro-table-image-radius"] = `${radius}px`;
  }
  if (objectFit) {
    style["--admin-pro-table-image-fit"] = objectFit;
  }
  if (objectPosition) {
    style["--admin-pro-table-image-position"] = `${objectPosition}`;
  }
  return Object.keys(style).length ? (style) : undefined;
}

export function ImageCell({ src, preview, fallback, ...styleOptions }: ImageCellProps) {
  return (
    <span className="admin-pro-table-image" style={getImageCellStyle(styleOptions)}>
      <Image alt="" src={src} width="100%" preview={preview} fallback={fallback} />
    </span>
  );
}
