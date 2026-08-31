import { Alert, Typography } from "antd";
import { MdxView } from "#pages/blog-shared/mdx-view";
import styles from "./blog.module.css";

interface BlogArticleProps {
  title: string;
  content: string;
  isPreview?: boolean;
}

export function BlogArticle({ title, content, isPreview = false }: BlogArticleProps) {
  return (
    <div className={styles.page}>
      <article className={styles.shell}>
        {isPreview ? (
          <Alert
            className={styles.previewFlag}
            type="info"
            showIcon
            message="预览模式：当前内容来自编辑器草稿，未走 MDX 编译"
          />
        ) : null}
        <p className={styles.kicker}>Campaign</p>
        <Typography.Title className={styles.title} level={1}>
          {title}
        </Typography.Title>
        <MdxView source={content} />
      </article>
    </div>
  );
}
