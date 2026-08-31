import type { ReactNode } from "react";
import { Countdown } from "./blocks/countdown";
import { CtaBlock } from "./blocks/cta-block";
import { HashTag } from "./blocks/hash-tag";
import { PriceCard } from "./blocks/price-card";
import { PromoBanner } from "./blocks/promo-banner";
import type { BlockAttrMap } from "./types";

export interface MarketingBlockProps {
  nodeName: string;
  attrs: BlockAttrMap;
  interactive?: boolean;
}

function textAttr(attrs: BlockAttrMap, key: string, fallback = "") {
  return attrs[key] ?? fallback;
}

export function MarketingBlock({ nodeName, attrs, interactive = false }: MarketingBlockProps) {
  switch (nodeName) {
    case "hashTag":
      return <HashTag label={textAttr(attrs, "label")} tone={textAttr(attrs, "tone", "hot")} />;
    case "promoBanner":
      return (
        <PromoBanner
          title={textAttr(attrs, "title")}
          subtitle={textAttr(attrs, "subtitle")}
          cta={textAttr(attrs, "cta")}
          href={textAttr(attrs, "href", "#")}
          theme={textAttr(attrs, "theme", "sunset")}
          interactive={interactive}
        />
      );
    case "countdown":
      return <Countdown title={textAttr(attrs, "title")} endAt={textAttr(attrs, "endAt")} />;
    case "priceCard":
      return (
        <PriceCard
          name={textAttr(attrs, "name")}
          current={textAttr(attrs, "current")}
          original={textAttr(attrs, "original")}
          badge={textAttr(attrs, "badge")}
        />
      );
    case "ctaBlock":
      return (
        <CtaBlock
          label={textAttr(attrs, "label")}
          hint={textAttr(attrs, "hint")}
          href={textAttr(attrs, "href", "#")}
          theme={textAttr(attrs, "theme", "primary")}
          interactive={interactive}
        />
      );
    default:
      return null;
  }
}

export function collectText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join("");
  }
  if (typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode } | undefined;
    return collectText(props?.children);
  }
  return "";
}
