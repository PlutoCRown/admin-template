import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Divider, Space } from "antd";
import { useEditorState, type Editor } from "@tiptap/react";
import { InsertBlockButton } from "./insert-block-button";
import styles from "./blog-editor.module.css";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      strike: current.isActive("strike"),
      bullet: current.isActive("bulletList"),
      ordered: current.isActive("orderedList"),
      h1: current.isActive("heading", { level: 1 }),
      h2: current.isActive("heading", { level: 2 }),
      h3: current.isActive("heading", { level: 3 }),
    }),
  });

  return (
    <div className={styles.toolbar}>
      <Space wrap size={4}>
        <Button
          size="small"
          type={state.h1 ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          size="small"
          type={state.h2 ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          size="small"
          type={state.h3 ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <Divider orientation="vertical" />
        <Button
          size="small"
          type={state.bold ? "primary" : "default"}
          icon={<BoldOutlined />}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Button
          size="small"
          type={state.italic ? "primary" : "default"}
          icon={<ItalicOutlined />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Button
          size="small"
          type={state.strike ? "primary" : "default"}
          icon={<StrikethroughOutlined />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <Button
          size="small"
          type={state.bullet ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Button
          size="small"
          type={state.ordered ? "primary" : "default"}
          icon={<OrderedListOutlined />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <InsertBlockButton editor={editor} />
      </Space>
    </div>
  );
}
