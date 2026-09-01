import type { Editor } from "@tiptap/react";
import type { BlockDef } from "#pages/blog-shared/types";

export function insertMdxBlock(
  editor: Editor,
  def: BlockDef,
  range?: { from: number; to: number },
) {
  const chain = editor.chain().focus();
  if (range) {
    chain.deleteRange(range);
  }
  chain.insertContent({ type: def.nodeName, attrs: def.defaults }).run();
}
