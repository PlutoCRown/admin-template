import { type MediaFile } from "#api/media";

export function FileCardPreview({ file }: { file: MediaFile }) {
  return (
    <div className="sortable-upload-item">
      <img src={file.url} alt={file.name} />
    </div>
  );
}
