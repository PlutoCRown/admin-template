import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

interface DragOverlaySurfaceProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** DragOverlay 新挂载时先无阴影，下一帧再抬起，让 box-shadow transition 能触发 */
export function DragOverlaySurface({ className, style, children }: DragOverlaySurfaceProps) {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLifted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={[className, lifted ? "is-lifted" : ""].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}
