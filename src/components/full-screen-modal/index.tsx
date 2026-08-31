import { isValidElement, type ReactNode } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Grid, Modal, Tabs, type ModalProps, type TabsProps } from "antd";
import "./full-screen-modal.css";

const DEFAULT_MARGIN = 96;
const DEFAULT_BACK_TEXT = "返回应用";

export interface FullScreenModalProps extends Pick<
  TabsProps,
  | "items"
  | "activeKey"
  | "defaultActiveKey"
  | "onChange"
  | "onTabClick"
  | "tabBarExtraContent"
  | "tabBarGutter"
  | "size"
  | "type"
  | "animated"
  | "centered"
  | "classNames"
  | "styles"
  | "destroyOnHidden"
> {
  open: boolean;
  onClose: () => void;
  /**
   * 弹窗外边距（px）。宽高分别为 `calc(100vw - margin)` / `calc(100vh - margin)`。
   * @default 96
   */
  margin?: number;
  /**
   * 覆盖自动响应式页签位置。不传时：桌面 `start`，窄屏（小于 md）`top`。
   */
  tabPlacement?: TabsProps["tabPlacement"];
  /** 返回按钮文案；传 `null` 隐藏返回按钮 */
  backText?: ReactNode | null;
  className?: string;
  rootClassName?: string;
  afterOpenChange?: ModalProps["afterOpenChange"];
}

type TabBarExtraObject = { left?: ReactNode; right?: ReactNode };

function isTabBarExtraObject(value: TabsProps["tabBarExtraContent"]): value is TabBarExtraObject {
  return (
    !!value &&
    typeof value === "object" &&
    !isValidElement(value) &&
    !Array.isArray(value) &&
    ("left" in value || "right" in value)
  );
}

function mergeTabBarExtraContent(
  backNode: ReactNode,
  tabBarExtraContent: TabsProps["tabBarExtraContent"],
): TabsProps["tabBarExtraContent"] {
  if (!backNode && !tabBarExtraContent) {
    return undefined;
  }

  if (isTabBarExtraObject(tabBarExtraContent)) {
    return {
      left: (
        <>
          {backNode}
          {tabBarExtraContent.left}
        </>
      ),
      right: tabBarExtraContent.right,
    };
  }

  return {
    left: (
      <>
        {backNode}
        {tabBarExtraContent}
      </>
    ),
  };
}

export function FullScreenModal({
  open,
  onClose,
  margin = DEFAULT_MARGIN,
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  onTabClick,
  tabBarExtraContent,
  tabBarGutter,
  size = "large",
  type,
  animated,
  centered,
  classNames,
  styles: tabsStyles,
  destroyOnHidden = true,
  tabPlacement: tabPlacementProp,
  backText = DEFAULT_BACK_TEXT,
  className,
  rootClassName,
  afterOpenChange,
}: FullScreenModalProps) {
  const screens = Grid.useBreakpoint();
  const tabPlacement = tabPlacementProp ?? (screens.md === false ? "top" : "start");
  const backLabel = typeof backText === "string" || backText == null ? backText : DEFAULT_BACK_TEXT;

  const backNode =
    backText === null ? null : (
      <button
        type="button"
        className="full-screen-modal-back"
        onClick={onClose}
        aria-label={typeof backLabel === "string" ? backLabel : DEFAULT_BACK_TEXT}
      >
        <ArrowLeftOutlined />
        {tabPlacement === "top" ? null : <span>{backText}</span>}
      </button>
    );

  const sizeStyle = {
    width: `calc(100vw - ${margin}px)`,
    height: `calc(100vh - ${margin}px)`,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      footer={null}
      closable={false}
      destroyOnHidden={destroyOnHidden}
      centered
      width={sizeStyle.width}
      rootClassName={["full-screen-modal", rootClassName].filter(Boolean).join(" ")}
      afterOpenChange={afterOpenChange}
      styles={{
        root: {
          ["--full-screen-modal-margin" as string]: `${margin}px`,
        },
        container: {
          height: sizeStyle.height,
          padding: 0,
          overflow: "hidden",
        },
        body: {
          height: "100%",
          padding: 0,
          overflow: "hidden",
        },
        header: {
          display: "none",
        },
      }}
    >
      <Tabs
        className={["full-screen-modal-tabs", className].filter(Boolean).join(" ")}
        tabPlacement={tabPlacement}
        items={items}
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey}
        onChange={onChange}
        onTabClick={onTabClick}
        tabBarExtraContent={mergeTabBarExtraContent(backNode, tabBarExtraContent)}
        tabBarGutter={tabBarGutter}
        size={size}
        type={type}
        animated={animated}
        centered={centered}
        classNames={classNames}
        styles={tabsStyles}
        destroyOnHidden={destroyOnHidden}
      />
    </Modal>
  );
}
