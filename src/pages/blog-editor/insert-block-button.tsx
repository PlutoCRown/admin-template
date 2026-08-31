import type { Editor } from "@tiptap/react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { BLOCK_DEFS } from "#pages/blog-shared/registry";

interface InsertBlockButtonProps {
  editor: Editor;
}

export function InsertBlockButton({ editor }: InsertBlockButtonProps) {
  return (
    <Dropdown
      menu={{
        items: BLOCK_DEFS.map((item) => ({
          key: item.nodeName,
          label: item.label,
          extra: item.name,
        })),
        onClick: ({ key }) => {
          const def = BLOCK_DEFS.find((item) => item.nodeName === key);
          if (!def) {
            return;
          }
          editor.chain().focus().insertContent({ type: def.nodeName, attrs: def.defaults }).run();
        },
      }}
    >
      <Button icon={<PlusOutlined />}>插入营销块</Button>
    </Dropdown>
  );
}
