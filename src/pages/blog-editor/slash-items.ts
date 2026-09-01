import Fuse from "fuse.js";
import type { Editor } from "@tiptap/react";
import { BLOCK_DEFS } from "#pages/blog-shared/registry";
import { insertMdxBlock } from "./insert-mdx-block";

export type SlashItemGroup = "文本" | "营销块";

export interface SlashItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  group: SlashItemGroup;
  command: (ctx: { editor: Editor; range: { from: number; to: number } }) => void;
}

const TEXT_ITEMS: SlashItem[] = [
  {
    id: "heading1",
    title: "标题 1",
    description: "页面主标题",
    keywords: ["h1", "heading", "标题"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    id: "heading2",
    title: "标题 2",
    description: "章节标题",
    keywords: ["h2", "heading", "标题"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    id: "heading3",
    title: "标题 3",
    description: "小节标题",
    keywords: ["h3", "heading", "标题"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    id: "bulletList",
    title: "无序列表",
    description: "项目符号列表",
    keywords: ["ul", "list", "列表", "bullet"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: "orderedList",
    title: "有序列表",
    description: "数字编号列表",
    keywords: ["ol", "list", "列表", "ordered", "数字"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: "blockquote",
    title: "引用",
    description: "引用一段说明",
    keywords: ["quote", "引用", "blockquote"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    id: "horizontalRule",
    title: "分割线",
    description: "插入一条分隔线",
    keywords: ["hr", "divider", "分割", "线"],
    group: "文本",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

const BLOCK_ITEMS: SlashItem[] = BLOCK_DEFS.map((def) => ({
  id: def.nodeName,
  title: def.label,
  description: def.description,
  keywords: [def.name, def.nodeName, def.label],
  group: "营销块" as const,
  command: ({ editor, range }) => {
    insertMdxBlock(editor, def, range);
  },
}));

export const SLASH_ITEMS: SlashItem[] = [...TEXT_ITEMS, ...BLOCK_ITEMS];

const fuse = new Fuse(SLASH_ITEMS, {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "keywords", weight: 0.3 },
    { name: "description", weight: 0.2 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
});

export function filterSlashItems(query: string): SlashItem[] {
  const needle = query.trim();
  if (!needle) {
    return SLASH_ITEMS;
  }
  const matched = new Set(fuse.search(needle).map((result) => result.item.id));
  return SLASH_ITEMS.filter((item) => matched.has(item.id));
}
