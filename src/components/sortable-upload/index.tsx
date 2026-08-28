import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DeleteOutlined, EyeOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { App, Button, Image, Upload } from "antd";
import { getErrorMessage } from "#api/client";
import { uploadFileApi } from "#api/products";
import type { MediaFile } from "#api/types";
import "./sortable-upload.css";

interface SortableUploadProps {
  value?: MediaFile[];
  onChange?: (value: MediaFile[]) => void;
  max?: number;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.35" },
    },
  }),
};

function OverlayCard({ file }: { file: MediaFile }) {
  return (
    <div className="sortable-upload-overlay">
      <img src={file.url} alt={file.name} />
      <div className="sortable-upload-overlay-meta">
        <strong>{file.name}</strong>
        <span>
          <HolderOutlined /> 自定义覆盖层 · {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>
    </div>
  );
}

function SortableFileCard({
  file,
  onPreview,
  onRemove,
}: {
  file: MediaFile;
  onPreview: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "is-dragging" : undefined}
      style={style}
      {...attributes}
    >
      <div className="sortable-upload-item" {...listeners}>
        <img src={file.url} alt={file.name} />
        <div className="sortable-upload-actions">
          <Button
            size="small"
            type="text"
            style={{ color: "#fff" }}
            icon={<EyeOutlined />}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
          />
          <Button
            size="small"
            type="text"
            style={{ color: "#fff" }}
            icon={<DeleteOutlined />}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          />
        </div>
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewUid, setPreviewUid] = useState<string | undefined>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const activeFile = useMemo(() => value.find((item) => item.uid === activeId), [activeId, value]);
  const ids = value.map((item) => item.uid);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
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

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="sortable-upload-grid">
            {value.map((file) => (
              <SortableFileCard
                key={file.uid}
                file={file}
                onPreview={() => setPreviewUid(file.uid)}
                onRemove={() => onChange?.(value.filter((item) => item.uid !== file.uid))}
              />
            ))}
            {value.length < max ? (
              <Upload
                accept="image/*"
                showUploadList={false}
                multiple
                disabled={value.length >= max}
                customRequest={async (options) => {
                  const file = options.file as File;
                  try {
                    const uploaded = await uploadFileApi(file);
                    onChange?.([...valueRef.current, uploaded]);
                    options.onSuccess?.(uploaded);
                  } catch (error) {
                    options.onError?.(error as Error);
                    message.error(getErrorMessage(error));
                  }
                }}
              >
                <div className="sortable-upload-add">
                  <PlusOutlined />
                  <span>上传</span>
                </div>
              </Upload>
            ) : null}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeFile ? <OverlayCard file={activeFile} /> : null}
        </DragOverlay>
      </DndContext>
      <Image.PreviewGroup
        items={value.map((item) => item.url)}
        preview={{
          open: Boolean(previewUid),
          current: Math.max(
            0,
            value.findIndex((item) => item.uid === previewUid),
          ),
          onOpenChange: (open) => {
            if (!open) {
              setPreviewUid(undefined);
            }
          },
          onChange: (current) => setPreviewUid(value[current]?.uid),
        }}
      />
    </div>
  );
}
