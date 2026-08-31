import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { App, Image, Upload, type UploadProps } from "antd";
import { getErrorMessage } from "#api/client";
import { uploadFileApi } from "#api/products";
import type { MediaFile } from "#api/types";
import "./sortable-upload.css";

interface SortableUploadProps {
  value?: MediaFile[];
  onChange?: (value: MediaFile[]) => void;
  max?: number;
}

interface SortableFileCardProps {
  file: MediaFile;
  onPreview: (uid: string) => void;
  onRemove: (uid: string) => void;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  !(isSorting || wasDragging);

function handleRemovePointerDown(event: PointerEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function FileCardPreview({ file }: { file: MediaFile }) {
  return (
    <div className="sortable-upload-item">
      <img src={file.url} alt={file.name} />
    </div>
  );
}

function SortableFileCard({ file, onPreview, onRemove }: SortableFileCardProps) {
  const draggedRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
    animateLayoutChanges,
  });

  useEffect(() => {
    if (isDragging) {
      draggedRef.current = true;
    }
  }, [isDragging]);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0 : undefined,
  };

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
    <div
      ref={setNodeRef}
      className={`sortable-upload-card${isDragging ? " is-dragging" : ""}`}
      style={style}
      {...attributes}
    >
      <div className="sortable-upload-item" {...listeners} onClick={handlePreview}>
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
    </div>
  );
}

export function SortableUpload({ value = [], onChange, max = 8 }: SortableUploadProps) {
  const { message } = App.useApp();
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const [previewUid, setPreviewUid] = useState<string | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const ids = value.map((item) => item.uid);
  const activeFile = activeId ? value.find((item) => item.uid === activeId) : undefined;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    onChange?.(arrayMove(value, oldIndex, newIndex));
  };

  const handlePreview = (uid: string) => {
    setPreviewUid(uid);
  };

  const handleRemove = (uid: string) => {
    onChange?.(value.filter((item) => item.uid !== uid));
  };

  const handleUpload: NonNullable<UploadProps["customRequest"]> = async (options) => {
    const file = options.file as File;
    try {
      const uploaded = await uploadFileApi(file);
      onChange?.([...valueRef.current, uploaded]);
      options.onSuccess?.(uploaded);
    } catch (error) {
      options.onError?.(error as Error);
      message.error(getErrorMessage(error));
    }
  };

  const handlePreviewOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewUid(undefined);
    }
  };

  const handlePreviewChange = (current: number) => {
    setPreviewUid(value[current]?.uid);
  };

  const renderFileCard = (file: MediaFile) => (
    <SortableFileCard
      key={file.uid}
      file={file}
      onPreview={handlePreview}
      onRemove={handleRemove}
    />
  );

  const fileCards = value.map(renderFileCard);
  const previewItems = value.map((item) => item.url);

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="sortable-upload-grid">
            {fileCards}
            {value.length < max ? (
              <Upload
                accept="image/*"
                showUploadList={false}
                multiple
                disabled={value.length >= max}
                customRequest={handleUpload}
              >
                <div className="sortable-upload-add">
                  <PlusOutlined />
                  <span>上传</span>
                </div>
              </Upload>
            ) : null}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeFile ? (
            <div className="sortable-upload-card is-overlay">
              <FileCardPreview file={activeFile} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Image.PreviewGroup
        items={previewItems}
        preview={{
          open: Boolean(previewUid),
          current: Math.max(
            0,
            value.findIndex((item) => item.uid === previewUid),
          ),
          onOpenChange: handlePreviewOpenChange,
          onChange: handlePreviewChange,
        }}
      />
    </div>
  );
}
