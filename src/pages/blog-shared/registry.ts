import type { BlockDef } from "./types";

export const BLOCK_DEFS: BlockDef[] = [
  {
    name: "HashTag",
    nodeName: "hashTag",
    htmlTag: "hashtag",
    label: "话题标签",
    description: "活动话题，文案写在标签体内",
    defaults: { label: "Trending", tone: "hot" },
    fields: [
      { key: "label", attr: "label", label: "文案", type: "text", asChildren: true },
      {
        key: "tone",
        attr: "tone",
        label: "风格",
        type: "select",
        options: [
          { label: "热门", value: "hot" },
          { label: "新品", value: "new" },
          { label: "限量", value: "limited" },
        ],
      },
    ],
  },
  {
    name: "PromoBanner",
    nodeName: "promoBanner",
    htmlTag: "promobanner",
    label: "促销横幅",
    description: "全宽主视觉，适合活动头图",
    defaults: {
      title: "限时折扣",
      subtitle: "精选品类满减进行中",
      cta: "立即抢购",
      href: "#",
      theme: "sunset",
    },
    fields: [
      { key: "title", attr: "title", label: "标题", type: "text" },
      { key: "subtitle", attr: "subtitle", label: "副标题", type: "textarea" },
      { key: "cta", attr: "cta", label: "按钮文案", type: "text" },
      { key: "href", attr: "href", label: "跳转链接", type: "text" },
      {
        key: "theme",
        attr: "theme",
        label: "配色",
        type: "select",
        options: [
          { label: "日落", value: "sunset" },
          { label: "海洋", value: "ocean" },
          { label: "森林", value: "forest" },
        ],
      },
    ],
  },
  {
    name: "Countdown",
    nodeName: "countdown",
    htmlTag: "countdown",
    label: "活动倒计时",
    description: "按结束时间实时倒数",
    defaults: {
      title: "活动结束还剩",
      endAt: "2026-09-15T23:59:59+08:00",
    },
    fields: [
      { key: "title", attr: "title", label: "标题", type: "text" },
      { key: "endAt", attr: "end-at", label: "结束时间", type: "datetime" },
    ],
  },
  {
    name: "PriceCard",
    nodeName: "priceCard",
    htmlTag: "pricecard",
    label: "价格卡片",
    description: "展示现价、划线和角标",
    defaults: {
      name: "人气单品",
      current: "199",
      original: "399",
      badge: "爆款",
    },
    fields: [
      { key: "name", attr: "name", label: "商品名", type: "text" },
      { key: "current", attr: "current", label: "现价", type: "text" },
      { key: "original", attr: "original", label: "原价", type: "text" },
      { key: "badge", attr: "badge", label: "角标", type: "text" },
    ],
  },
  {
    name: "CtaBlock",
    nodeName: "ctaBlock",
    htmlTag: "ctablock",
    label: "行动号召",
    description: "转化按钮 + 补充说明",
    defaults: {
      label: "立即参与",
      hint: "数量有限，先到先得",
      href: "#",
      theme: "primary",
    },
    fields: [
      { key: "label", attr: "label", label: "按钮文案", type: "text" },
      { key: "hint", attr: "hint", label: "补充说明", type: "text" },
      { key: "href", attr: "href", label: "跳转链接", type: "text" },
      {
        key: "theme",
        attr: "theme",
        label: "风格",
        type: "select",
        options: [
          { label: "品牌色", value: "primary" },
          { label: "深色", value: "dark" },
        ],
      },
    ],
  },
];

const byNodeName = new Map(BLOCK_DEFS.map((item) => [item.nodeName, item]));
const byTagName = new Map(BLOCK_DEFS.map((item) => [item.name, item]));
const byHtmlTag = new Map(BLOCK_DEFS.map((item) => [item.htmlTag, item]));

export function getBlockDefByNodeName(nodeName: string) {
  return byNodeName.get(nodeName);
}

export function getBlockDefByTagName(name: string) {
  return byTagName.get(name);
}

export function getBlockDefByHtmlTag(htmlTag: string) {
  return byHtmlTag.get(htmlTag);
}

export const BLOCK_TAG_PATTERN = BLOCK_DEFS.map((item) => item.name).join("|");
