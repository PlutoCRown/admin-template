import { Suspense, use, useState } from "react";
import { Spin } from "antd";
import { Navigate, useNavigate, useParams } from "react-router";
import { readBlogPost } from "#pages/blog-shared/post-loader";
import { EditorModal, type EditorModalProps } from "./editor-modal";
import { EditorWorkspace } from "./editor-workspace";
import styles from "./blog-editor.module.css";

type EditorChromeProps = Pick<EditorModalProps, "open" | "onClose" | "afterOpenChange">;

function EditorFallback({ open, onClose, afterOpenChange }: EditorChromeProps) {
  return (
    <EditorModal
      open={open}
      onClose={onClose}
      afterOpenChange={afterOpenChange}
      editor={
        <div className={styles.editorLoading}>
          <Spin />
        </div>
      }
      preview={null}
      source={null}
    />
  );
}

function EditorBody({ id, ...chromeProps }: { id: string } & EditorChromeProps) {
  const result = use(readBlogPost(id));
  if (!result.ok) {
    return <Navigate to="/blog-manage" replace />;
  }
  return <EditorWorkspace post={result.post} {...chromeProps} />;
}

export function BlogEditorRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/blog-manage/edit/${id}` : "/blog-manage"} replace />;
}

export function BlogEditorPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleAfterOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      void navigate("/blog-manage", { replace: true });
    }
  };

  const chromeProps: EditorChromeProps = {
    open,
    onClose: () => setOpen(false),
    afterOpenChange: handleAfterOpenChange,
  };

  if (!id) {
    return <Navigate to="/blog-manage" replace />;
  }

  return (
    <Suspense fallback={<EditorFallback {...chromeProps} />}>
      <EditorBody id={id} {...chromeProps} />
    </Suspense>
  );
}
