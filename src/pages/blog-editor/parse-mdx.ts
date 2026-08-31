import { generateJSON } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { marked } from "marked";
import { BLOCK_TAG_PATTERN, getBlockDefByTagName } from "#pages/blog-shared/registry";
import type { BlockAttrMap } from "#pages/blog-shared/types";
import { proseExtensions } from "./prose-extensions";

const BLOCK_RE = new RegExp(`<(${BLOCK_TAG_PATTERN})(\\s[^>]*)?>([\\s\\S]*?)</\\1>`, "g");

function decodeEntities(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function parseAttrs(raw: string | undefined, defName: string): BlockAttrMap {
  const def = getBlockDefByTagName(defName);
  const attrs: BlockAttrMap = { ...def?.defaults };
  if (!raw || !def) {
    return attrs;
  }
  const attrRe = /([\w-]+)\s*=\s*"([^"]*)"/g;
  for (const match of raw.matchAll(attrRe)) {
    const name = match[1];
    const value = decodeEntities(match[2] ?? "");
    const field = def.fields.find((item) => item.attr === name || item.key === name);
    if (field && !field.asChildren) {
      attrs[field.key] = value;
    }
  }
  return attrs;
}

interface MdxChunk {
  kind: "markdown" | "block";
  value?: string;
  name?: string;
  rawAttrs?: string;
  inner?: string;
}

function splitMdx(source: string): MdxChunk[] {
  const chunks: MdxChunk[] = [];
  let lastIndex = 0;
  for (const match of source.matchAll(BLOCK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      chunks.push({ kind: "markdown", value: source.slice(lastIndex, index) });
    }
    chunks.push({
      kind: "block",
      name: match[1],
      rawAttrs: match[2],
      inner: match[3],
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < source.length) {
    chunks.push({ kind: "markdown", value: source.slice(lastIndex) });
  }
  return chunks;
}

function markdownToNodes(source: string): JSONContent[] {
  const trimmed = source.trim();
  if (!trimmed) {
    return [];
  }
  const html = marked.parse(trimmed, { async: false });
  if (typeof html !== "string" || !html.trim()) {
    return [];
  }
  const json = generateJSON(html, proseExtensions) as JSONContent;
  return json.content ?? [];
}

export function parseMdx(source: string): JSONContent {
  const content: JSONContent[] = [];
  for (const chunk of splitMdx(source)) {
    if (chunk.kind === "markdown") {
      content.push(...markdownToNodes(chunk.value ?? ""));
      continue;
    }
    const def = chunk.name ? getBlockDefByTagName(chunk.name) : undefined;
    if (!def) {
      continue;
    }
    const attrs = parseAttrs(chunk.rawAttrs, def.name);
    const childrenField = def.fields.find((field) => field.asChildren);
    if (childrenField) {
      attrs[childrenField.key] = decodeEntities(chunk.inner ?? "").trim();
    }
    content.push({ type: def.nodeName, attrs });
  }
  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }
  return { type: "doc", content };
}
