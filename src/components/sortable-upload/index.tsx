import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { App, Image, Upload, type UploadProps } from "antd";
import { getErrorMessage } from "#api/base/client";
import { uploadFileApi, type MediaFile } from "#api/media";
import {
  SortableItem,
  SortableList,
  useSortableItem,
  type SortableMoveEvent,
} from "#components/sortable-list";
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

export function SortableUpload({ value = [], onChange, max = 8 }: SortableUploadProps) {
  const { message } = App.useApp();
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const [previewUid, setPreviewUid] = useState<string | undefined>();

  const ids = value.map((item) => item.uid);

  const handleMove = ({ fromIndex, toIndex }: SortableMoveEvent) => {
    onChange?.(arrayMove(value, fromIndex, toIndex));
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
    <SortableItem
      key={file.uid}
      id={file.uid}
      className="sortable-upload-card"
      draggingClassName="is-dragging"
    >
      <SortableFileCard file={file} onPreview={handlePreview} onRemove={handleRemove} />
    </SortableItem>
  );

  const renderOverlay = (activeId: string | number) => {
    const activeFile = value.find((item) => item.uid === activeId);
    return activeFile ? <FileCardPreview file={activeFile} /> : null;
  };

  const fileCards = value.map(renderFileCard);
  const previewItems = value.map((item) => item.url);

  return (
    <div>
      <SortableList
        ids={ids}
        strategy={rectSortingStrategy}
        activationDistance={8}
        onMove={handleMove}
        renderOverlay={renderOverlay}
        overlayClassName="sortable-upload-card is-overlay"
        matchOverlayWidth={false}
      >
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
      </SortableList>
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
