import { Suspense, use } from "react";
import { Result, Spin } from "antd";
import { useParams, useSearchParams } from "react-router";
import { readBlogPost } from "#pages/blog-shared/post-loader";
import { readBlogPreview } from "#pages/blog-shared/preview-storage";
import { BlogArticle } from "./blog-article";
import styles from "./blog.module.css";

function BlogFallback() {
  return (
    <div className={styles.loading}>
      <Spin />
    </div>
  );
}

function BlogRemote({ id }: { id: string }) {
  const result = use(readBlogPost(id));
  if (!result.ok) {
    return (
      <div className={styles.empty}>
        <Result status="404" title="活动不存在" />
      </div>
    );
  }
  return <BlogArticle title={result.post.title} content={result.post.content} />;
}

export function BlogPage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const preview = isPreview ? readBlogPreview(id) : null;

  if (preview) {
    return <BlogArticle title={preview.title} content={preview.content} isPreview />;
  }

  return (
    <Suspense fallback={<BlogFallback />}>
      <BlogRemote id={id} />
    </Suspense>
  );
}
