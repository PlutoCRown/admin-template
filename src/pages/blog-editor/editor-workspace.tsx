import { useRef, useState } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { App, Button, Input, Radio } from "antd";
import { updateBlogPostApi, type BlogPost, type BlogPostStatus } from "#api/blog/posts";
import { writeBlogPostCache } from "#pages/blog-shared/post-loader";
import { writeBlogPreview } from "#pages/blog-shared/preview-storage";
import { withBasePath } from "#utils/base-path";
import { EditorModal, type EditorModalProps } from "./editor-modal";
import { MdxEditor } from "./mdx-editor";
import { PreviewPane } from "./preview-pane";
import { SourcePane } from "./source-pane";
import styles from "./blog-editor.module.css";

type EditorWorkspaceProps = Pick<EditorModalProps, "open" | "onClose" | "afterOpenChange"> & {
  post: BlogPost;
};

export function EditorWorkspace({ post, open, onClose, afterOpenChange }: EditorWorkspaceProps) {
  const { message } = App.useApp();
  const [title, setTitle] = useState(post.title);
  const [status, setStatus] = useState<BlogPostStatus>(post.status);
  const [saving, setSaving] = useState(false);
  const [activeKey, setActiveKey] = useState("editor");
  const [previewSource, setPreviewSource] = useState(post.content);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [sourceEditing, setSourceEditing] = useState(false);
  const sourceRef = useRef<() => string>(() => post.content);
  const applySourceRef = useRef<(content: string) => void>(() => undefined);

  const readSource = () => {
    if (activeKey === "source" && sourceEditing) {
      return previewSource;
    }
    return sourceRef.current();
  };

  const applySourceDraft = () => {
    if (sourceEditing) {
      applySourceRef.current(previewSource);
    }
  };

  const syncPreview = () => {
    const nextContent = readSource();
    setPreviewSource(nextContent);
    writeBlogPreview(post.id, {
      title: title.trim() || "未命名活动",
      content: nextContent,
    });
    setPreviewNonce((value) => value + 1);
  };

  const handleTabChange = (key: string) => {
    if (activeKey === "source") {
      applySourceDraft();
    }
    if (key === "preview" || key === "source") {
      syncPreview();
    }
    setActiveKey(key);
  };

  const handleSourceEditingChange = (editing: boolean) => {
    if (!editing) {
      applySourceRef.current(previewSource);
    }
    setSourceEditing(editing);
  };

  const handleSave = async () => {
    const nextContent = readSource();
    const nextTitle = title.trim() || "未命名活动";
    setSaving(true);
    try {
      const saved = await updateBlogPostApi(post.id, {
        title: nextTitle,
        content: nextContent,
        status,
      });
      writeBlogPostCache(saved);
      message.success("已保存");
      setSaving(false);
      return true;
    } catch {
      setSaving(false);
      return false;
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "draft" || value === "published") {
      setStatus(value);
    }
  };

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      afterOpenChange={afterOpenChange}
      activeKey={activeKey}
      onChange={handleTabChange}
      editor={
        <div className={styles.workspace}>
          <div className={styles.header}>
            <Input
              className={styles.titleField}
              value={title}
              placeholder="活动标题"
              onChange={(event) => setTitle(event.target.value)}
            />
            <Radio.Group
              value={status}
              optionType="button"
              options={[
                { label: "草稿", value: "draft" },
                { label: "已发布", value: "published" },
              ]}
              onChange={(event) => handleStatusChange(event.target.value)}
            />
            <Button
              className={styles.headerActions}
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => void handleSave()}
            >
              保存
            </Button>
          </div>
          <p className={styles.hint}>
            所见即所得，营销块点击后在悬浮窗里改字段；保存的是 MDX 字符串
          </p>
          <MdxEditor
            key={post.id}
            content={post.content}
            sourceRef={sourceRef}
            applySourceRef={applySourceRef}
          />
        </div>
      }
      preview={
        previewNonce > 0 ? (
          <PreviewPane src={`${withBasePath(`/blog/${post.id}`)}?preview=1&t=${previewNonce}`} />
        ) : null
      }
      source={
        <SourcePane
          source={previewSource}
          editing={sourceEditing}
          onEditingChange={handleSourceEditingChange}
          onChange={setPreviewSource}
        />
      }
    />
  );
}
