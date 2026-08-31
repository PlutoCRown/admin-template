export type BlockFieldType = "text" | "textarea" | "select" | "datetime";

export interface BlockFieldOption {
  label: string;
  value: string;
}

export interface BlockFieldDef {
  key: string;
  /** MDX / HTML 属性名（kebab-case），`asChildren` 字段不输出为属性 */
  attr: string;
  label: string;
  type: BlockFieldType;
  asChildren?: boolean;
  options?: BlockFieldOption[];
}

export interface BlockDef {
  /** 序列化标签名，例如 `HashTag` */
  name: string;
  /** TipTap node 名，例如 `hashTag` */
  nodeName: string;
  /** rehype/parse5 后的小写标签，例如 `hashtag` */
  htmlTag: string;
  label: string;
  description: string;
  defaults: Record<string, string>;
  fields: BlockFieldDef[];
}

export type BlockAttrMap = Record<string, string>;
