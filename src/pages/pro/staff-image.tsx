import { Image } from "antd";

export const DEFAULT_STAFF_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%231677ff'/%3E%3Ctext x='64' y='64' fill='white' font-size='64' font-family='sans-serif' text-anchor='middle' dominant-baseline='central'%3E%E5%91%98%3C/text%3E%3C/svg%3E";

interface StaffImageProps {
  alt: string;
  src: string;
}

export function StaffImage({ alt, src }: StaffImageProps) {
  return (
    <Image
      alt={alt}
      src={src || DEFAULT_STAFF_IMAGE}
      fallback={DEFAULT_STAFF_IMAGE}
      width={48}
      height={48}
      style={{ objectFit: "cover" }}
    />
  );
}
