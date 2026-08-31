import { useRef, useState } from "react";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Input, Radio, Space } from "antd";
import { updateBlogPostApi, type BlogPost, type BlogPostStatus } from "#api/blog/posts";
import { PageContainer } from "#components/page-container";
import { writeBlogPostCache } from "#pages/blog-shared/post-loader";
import { writeBlogPreview } from "#pages/blog-shared/preview-storage";
import { withBasePath } from "#utils/base-path";
import { MdxEditor } from "./mdx-editor";
import { PreviewModal } from "./preview-modal";
import styles from "./blog-editor.module.css";

interface EditorWorkspaceProps {
  post: BlogPost;
}

export function EditorWorkspace({ post }: EditorWorkspaceProps) {
  const { message } = App.useApp();
  const [title, setTitle] = useState(post.title);
  const [status, setStatus] = useState<BlogPostStatus>(post.status);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState("");
  const sourceRef = useRef<() => string>(() => post.content);

  const readSource = () => sourceRef.current();

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
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const nextContent = readSource();
    setPreviewSource(nextContent);
    writeBlogPreview(post.id, { title: title.trim() || "未命名活动", content: nextContent });
    setPreviewOpen(true);
  };

  const handleStatusChange = (value: string) => {
    if (value === "draft" || value === "published") {
      setStatus(value);
    }
  };

  return (
    <PageContainer
      title="内容编辑"
      subTitle="所见即所得，营销块点击后在悬浮窗里改字段；保存的是 MDX 字符串"
      extra={
        <Space>
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            前台预览
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => void handleSave()}
          >
            保存
          </Button>
        </Space>
      }
    >
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
      </div>
      <MdxEditor key={post.id} content={post.content} sourceRef={sourceRef} />
      <PreviewModal
        open={previewOpen}
        src={withBasePath(`/blog/${post.id}?preview=1`)}
        source={previewSource}
        onClose={() => setPreviewOpen(false)}
      />
    </PageContainer>
  );
}
