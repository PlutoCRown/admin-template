import { Suspense, use } from "react";
import { Spin } from "antd";
import { Navigate, useParams } from "react-router";
import { PageContainer } from "#components/page-container";
import { readBlogPost } from "#pages/blog-shared/post-loader";
import { EditorWorkspace } from "./editor-workspace";
import styles from "./blog-editor.module.css";

function EditorFallback() {
  return (
    <PageContainer title="内容编辑">
      <div className={styles.editorLoading}>
        <Spin />
      </div>
    </PageContainer>
  );
}

function EditorBody({ id }: { id: string }) {
  const result = use(readBlogPost(id));
  if (!result.ok) {
    return <Navigate to="/blog-manage" replace />;
  }
  return <EditorWorkspace post={result.post} />;
}

export function BlogEditorPage() {
  const { id = "" } = useParams();
  if (!id) {
    return <Navigate to="/blog-manage" replace />;
  }
  return (
    <Suspense fallback={<EditorFallback />}>
      <EditorBody id={id} />
    </Suspense>
  );
}
