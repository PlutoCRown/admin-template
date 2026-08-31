import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import articleStyles from "./article.module.css";
import { mdxComponents } from "./mdx-components";
import { mdxSanitizeSchema } from "./sanitize-schema";

export interface MdxViewProps {
  source: string;
  className?: string;
}

export function MdxView({ source, className }: MdxViewProps) {
  const classes = [articleStyles.article, className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, mdxSanitizeSchema]]}
        components={mdxComponents}
      >
        {source}
      </Markdown>
    </div>
  );
}
