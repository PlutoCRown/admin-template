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
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
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

const DROP_TRANSITION_DURATION = 250;
const DROP_TRANSITION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function handleRemovePointerDown(event: PointerEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function getSortableTransition(isDragging: boolean, transition?: string) {
  if (isDragging) {
    return undefined;
  }

  const transformTransition =
    transition ?? `transform ${DROP_TRANSITION_DURATION}ms ${DROP_TRANSITION_EASING}`;
  return `${transformTransition}, z-index 0s ${DROP_TRANSITION_DURATION}ms`;
}

function SortableFileCard({ file, onPreview, onRemove }: SortableFileCardProps) {
  const draggedRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
    transition: {
      duration: DROP_TRANSITION_DURATION,
      easing: DROP_TRANSITION_EASING,
    },
  });

  useEffect(() => {
    if (isDragging) {
      draggedRef.current = true;
    }
  }, [isDragging]);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: getSortableTransition(isDragging, transition),
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const ids = value.map((item) => item.uid);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
