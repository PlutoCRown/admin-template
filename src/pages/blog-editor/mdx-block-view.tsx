import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popover, Space } from "antd";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { MarketingBlock } from "#pages/blog-shared/marketing-block";
import { getBlockDefByNodeName } from "#pages/blog-shared/registry";
import type { BlockAttrMap } from "#pages/blog-shared/types";
import { BlockEditForm } from "./block-edit-form";
import styles from "./blog-editor.module.css";

function attrToString(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function toAttrMap(attrs: Record<string, unknown> | undefined): BlockAttrMap {
  if (!attrs) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [key, attrToString(value)]),
  );
}

export function MdxBlockView({ node, selected, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);
  const def = getBlockDefByNodeName(node.type.name);
  const attrs = toAttrMap(node.attrs);

  if (!def) {
    return <NodeViewWrapper />;
  }

  const handleSave = (next: BlockAttrMap) => {
    updateAttributes(next);
    setOpen(false);
  };

  return (
    <NodeViewWrapper className={styles.blockWrap}>
      <Popover
        trigger="click"
        open={open}
        placement="bottomLeft"
        destroyOnHidden
        onOpenChange={setOpen}
        content={
          <div className={styles.popover}>
            <div className={styles.popoverHead}>
              <strong>{def.label}</strong>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={deleteNode}
              >
                删除
              </Button>
            </div>
            <BlockEditForm def={def} attrs={attrs} onSave={handleSave} />
            <Space className={styles.popoverHint}>
              <span>点击块即可改字段，保存后写入节点属性</span>
            </Space>
          </div>
        }
      >
        <div
          className={selected ? `${styles.block} ${styles.blockSelected}` : styles.block}
          contentEditable={false}
        >
          <MarketingBlock nodeName={def.nodeName} attrs={attrs} />
        </div>
      </Popover>
    </NodeViewWrapper>
  );
}
