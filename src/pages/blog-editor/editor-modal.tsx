import type { ReactNode } from "react";
import { CodeOutlined, DesktopOutlined, EditOutlined } from "@ant-design/icons";
import { Grid, type ModalProps } from "antd";
import { FullScreenModal } from "#components/full-screen-modal";

export interface EditorModalProps {
  open: boolean;
  onClose: () => void;
  afterOpenChange?: ModalProps["afterOpenChange"];
  editor: ReactNode;
  preview: ReactNode;
  source: ReactNode;
  activeKey?: string;
  onChange?: (key: string) => void;
}

export function EditorModal({
  open,
  onClose,
  afterOpenChange,
  editor,
  preview,
  source,
  activeKey,
  onChange,
}: EditorModalProps) {
  const screens = Grid.useBreakpoint();

  return (
    <FullScreenModal
      open={open}
      onClose={onClose}
      afterOpenChange={afterOpenChange}
      margin={screens.md === false ? 24 : 96}
      backText="返回列表"
      destroyOnHidden={false}
      activeKey={activeKey}
      defaultActiveKey="editor"
      onChange={onChange}
      items={[
        {
          key: "editor",
          label: "内容编辑",
          icon: <EditOutlined />,
          forceRender: true,
          children: editor,
        },
        {
          key: "preview",
          label: "前台预览",
          icon: <DesktopOutlined />,
          children: preview,
        },
        {
          key: "source",
          label: "MDX 源码",
          icon: <CodeOutlined />,
          children: source,
        },
      ]}
    />
  );
}
