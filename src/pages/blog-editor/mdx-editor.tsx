import { useEffect, type MutableRefObject } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import articleStyles from "#pages/blog-shared/article.module.css";
import { editorExtensions } from "./extensions";
import { EditorToolbar } from "./editor-toolbar";
import { parseMdx } from "./parse-mdx";
import { serializeMdx } from "./serialize-mdx";
import styles from "./blog-editor.module.css";

interface MdxEditorProps {
  content: string;
  sourceRef: MutableRefObject<() => string>;
  applySourceRef: MutableRefObject<(content: string) => void>;
}

export function MdxEditor({ content, sourceRef, applySourceRef }: MdxEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: parseMdx(content),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.prose,
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    sourceRef.current = () => serializeMdx(editor.getJSON());
    applySourceRef.current = (nextContent: string) => {
      editor.commands.setContent(parseMdx(nextContent));
    };
  }, [applySourceRef, editor, sourceRef]);

  if (!editor) {
    return <div className={styles.editorLoading}>编辑器加载中…</div>;
  }

  return (
    <div className={styles.editorShell}>
      <EditorToolbar editor={editor} />
      <div className={`${styles.surface} ${articleStyles.article}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
