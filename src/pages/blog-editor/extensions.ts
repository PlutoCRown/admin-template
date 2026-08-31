import Placeholder from "@tiptap/extension-placeholder";
import { Node, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import { BLOCK_DEFS } from "#pages/blog-shared/registry";
import { MdxBlockView } from "./mdx-block-view";
import { proseExtensions } from "./prose-extensions";

function createMdxBlockExtension(nodeName: string, tagName: string) {
  return Node.create({
    name: nodeName,
    group: "block",
    atom: true,
    selectable: true,
    addAttributes() {
      const def = BLOCK_DEFS.find((item) => item.nodeName === nodeName);
      return Object.fromEntries(
        (def?.fields ?? []).map((field) => [
          field.key,
          { default: def?.defaults[field.key] ?? "" },
        ]),
      );
    },
    parseHTML() {
      return [{ tag: tagName }, { tag: tagName.toLowerCase() }];
    },
    renderHTML({ HTMLAttributes }) {
      return [tagName.toLowerCase(), mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return ReactNodeViewRenderer(MdxBlockView);
    },
  });
}

export const editorExtensions = [
  ...proseExtensions,
  Placeholder.configure({
    placeholder: "输入正文，或从工具栏插入营销块",
  }),
  ...BLOCK_DEFS.map((item) => createMdxBlockExtension(item.nodeName, item.name)),
];
