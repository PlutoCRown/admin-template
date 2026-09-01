import styles from "./blog-editor.module.css";

interface PreviewPaneProps {
  src: string;
}

export function PreviewPane({ src }: PreviewPaneProps) {
  return (
    <div className={styles.previewFrame}>
      <iframe
        title="前台预览"
        src={src}
        className={styles.iframe}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
