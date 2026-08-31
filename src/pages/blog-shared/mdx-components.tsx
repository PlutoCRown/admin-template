import type { ComponentType, ReactNode } from "react";
import type { Components } from "react-markdown";
import { collectText, MarketingBlock } from "./marketing-block";
import { getBlockDefByHtmlTag } from "./registry";
import type { BlockAttrMap } from "./types";

interface HtmlTagProps {
  children?: ReactNode;
  node?: unknown;
  [key: string]: unknown;
}

function attrsFromHtml(htmlTag: string, props: HtmlTagProps): BlockAttrMap {
  const def = getBlockDefByHtmlTag(htmlTag);
  if (!def) {
    return {};
  }
  const attrs: BlockAttrMap = { ...def.defaults };
  for (const field of def.fields) {
    if (field.asChildren) {
      attrs[field.key] = collectText(props.children).trim() || def.defaults[field.key] || "";
      continue;
    }
    const raw = props[field.attr] ?? props[field.key];
    if (typeof raw === "string" && raw.length > 0) {
      attrs[field.key] = raw;
    }
  }
  return attrs;
}

function createHtmlAdapter(htmlTag: string, nodeName: string): ComponentType<HtmlTagProps> {
  function HtmlAdapter(props: HtmlTagProps) {
    return <MarketingBlock nodeName={nodeName} attrs={attrsFromHtml(htmlTag, props)} interactive />;
  }
  HtmlAdapter.displayName = `Mdx(${htmlTag})`;
  return HtmlAdapter;
}

export const mdxComponents = {
  hashtag: createHtmlAdapter("hashtag", "hashTag"),
  promobanner: createHtmlAdapter("promobanner", "promoBanner"),
  countdown: createHtmlAdapter("countdown", "countdown"),
  pricecard: createHtmlAdapter("pricecard", "priceCard"),
  ctablock: createHtmlAdapter("ctablock", "ctaBlock"),
} as Components;
