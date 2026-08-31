import type { JSONContent } from "@tiptap/react";
import { getBlockDefByNodeName } from "#pages/blog-shared/registry";
import type { BlockAttrMap, BlockDef } from "#pages/blog-shared/types";

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeMarkdown(value: string) {
  return value.replaceAll(/([\\`*[\]#_])/g, "\\$1");
}

function attrMap(attrs: JSONContent["attrs"]): BlockAttrMap {
  if (!attrs) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [key, value == null ? "" : String(value)]),
  );
}

function applyMarks(text: string, marks: JSONContent["marks"]) {
  let result = text;
  const list = marks ?? [];
  if (list.some((mark) => mark.type === "code")) {
    result = `\`${result}\``;
  }
  if (list.some((mark) => mark.type === "bold")) {
    result = `**${result}**`;
  }
  if (list.some((mark) => mark.type === "italic")) {
    result = `*${result}*`;
  }
  if (list.some((mark) => mark.type === "strike")) {
    result = `~~${result}~~`;
  }
  const link = list.find((mark) => mark.type === "link");
  if (link) {
    const href = String(link.attrs?.href ?? "");
    result = `[${result}](${href})`;
  }
  return result;
}

function serializeInline(nodes: JSONContent[] | undefined): string {
  if (!nodes?.length) {
    return "";
  }
  return nodes
    .map((node) => {
      if (node.type === "hardBreak") {
        return "  \n";
      }
      if (node.type === "text") {
        return applyMarks(escapeMarkdown(node.text ?? ""), node.marks);
      }
      return "";
    })
    .join("");
}

function serializeBlockTag(def: BlockDef, attrs: BlockAttrMap) {
  const attrText = def.fields
    .filter((field) => !field.asChildren)
    .map((field) => {
      const value = attrs[field.key] ?? def.defaults[field.key] ?? "";
      if (!value) {
        return "";
      }
      return ` ${field.attr}="${escapeAttr(value)}"`;
    })
    .join("");
  const childrenField = def.fields.find((field) => field.asChildren);
  const children = childrenField
    ? escapeText(attrs[childrenField.key] ?? def.defaults[childrenField.key] ?? "")
    : "";
  return `<${def.name}${attrText}>${children}</${def.name}>`;
}

function serializeList(node: JSONContent, ordered: boolean): string {
  return (node.content ?? [])
    .map((item, index) => {
      const bullet = ordered ? `${index + 1}. ` : "- ";
      const body = (item.content ?? [])
        .map((child) => {
          if (child.type === "paragraph") {
            return serializeInline(child.content);
          }
          if (child.type === "bulletList") {
            return serializeList(child, false)
              .split("\n")
              .map((line) => (line ? `  ${line}` : line))
              .join("\n");
          }
          if (child.type === "orderedList") {
            return serializeList(child, true)
              .split("\n")
              .map((line) => (line ? `  ${line}` : line))
              .join("\n");
          }
          return serializeNode(child);
        })
        .filter(Boolean)
        .join("\n");
      const [first, ...rest] = body.split("\n");
      return [`${bullet}${first ?? ""}`, ...rest.map((line) => `  ${line}`)].join("\n");
    })
    .join("\n");
}

function serializeNode(node: JSONContent): string {
  const def = node.type ? getBlockDefByNodeName(node.type) : undefined;
  if (def) {
    return serializeBlockTag(def, attrMap(node.attrs));
  }
  switch (node.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, Number(node.attrs?.level ?? 1)));
      return `${"#".repeat(level)} ${serializeInline(node.content)}`;
    }
    case "paragraph":
      return serializeInline(node.content);
    case "blockquote":
      return (node.content ?? [])
        .map((child) => serializeNode(child))
        .join("\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "bulletList":
      return serializeList(node, false);
    case "orderedList":
      return serializeList(node, true);
    case "codeBlock": {
      const language = String(node.attrs?.language ?? "");
      const code = (node.content ?? []).map((child) => child.text ?? "").join("");
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }
    case "horizontalRule":
      return "---";
    case "doc":
      return (node.content ?? []).map((child) => serializeNode(child)).join("\n\n");
    default:
      return (node.content ?? []).map((child) => serializeNode(child)).join("\n\n");
  }
}

export function serializeMdx(doc: JSONContent): string {
  return serializeNode(doc).trim();
}
