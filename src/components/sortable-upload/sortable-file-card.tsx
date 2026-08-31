import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { type MediaFile } from "#api/media";
import { useSortableItem } from "#components/sortable-list";

interface SortableFileCardProps {
  file: MediaFile;
  onPreview: (uid: string) => void;
  onRemove: (uid: string) => void;
}

function handleRemovePointerDown(event: PointerEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

export function SortableFileCard({ file, onPreview, onRemove }: SortableFileCardProps) {
  const draggedRef = useRef(false);
  const { attributes, listeners, isDragging } = useSortableItem();

  useEffect(() => {
    if (isDragging) {
      draggedRef.current = true;
    }
  }, [isDragging]);

  const handlePreview = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onPreview(file.uid);
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove(file.uid);
  };

  return (
    <div className="sortable-upload-item" {...attributes} {...listeners} onClick={handlePreview}>
      <img src={file.url} alt={file.name} />
      <button
        type="button"
        className="sortable-upload-remove"
        aria-label="删除"
        onPointerDown={handleRemovePointerDown}
        onClick={handleRemove}
      >
        <CloseOutlined />
      </button>
    </div>
  );
}
