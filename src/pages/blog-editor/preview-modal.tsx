import { CodeOutlined, DesktopOutlined } from "@ant-design/icons";
import { FullScreenModal } from "#components/full-screen-modal";
import styles from "./blog-editor.module.css";

interface PreviewModalProps {
  open: boolean;
  src: string;
  source: string;
  onClose: () => void;
}

export function PreviewModal({ open, src, source, onClose }: PreviewModalProps) {
  return (
    <FullScreenModal
      open={open}
      onClose={onClose}
      defaultActiveKey="preview"
      items={[
        {
          key: "preview",
          label: "前台预览",
          icon: <DesktopOutlined />,
          children: (
            <div className={styles.previewFrame}>
              <iframe
                title="前台预览"
                src={src}
                className={styles.iframe}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ),
        },
        {
          key: "source",
          label: "MDX 源码",
          icon: <CodeOutlined />,
          children: (
            <pre className={styles.source}>
              <code>{source}</code>
            </pre>
          ),
        },
      ]}
    />
  );
}
