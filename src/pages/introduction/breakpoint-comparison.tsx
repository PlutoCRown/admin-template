import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ProFormSelect as AntProFormSelect,
  ProFormText as AntProFormText,
  QueryFilter as ProQueryForm,
} from "@ant-design/pro-components";
import { Tag } from "antd";
import { FormSelect, FormText, ProForm } from "#components/form";
import { ExpandableCode } from "./expandable-code";
import styles from "./introduction.module.css";

const MIN_DEMO_WIDTH = 375;
const MAX_DEMO_WIDTH = 3840;
const MIN_FRAME_PERCENT = 32;
const HANDLE_KEY_STEP = 120;
const queryFormSpan = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 };

const breakpointCode = `import { QueryFilter as ProQueryForm } from "@ant-design/pro-components";

<ProQueryForm
  span={{ xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }}
  submitter={false}
>
  <ProFormText name="id" label="ID" />
  <ProFormText name="name" label="姓名" />
  <ProFormSelect name="role" label="角色" />
  <ProFormText name="address" label="详细地址" />
</ProQueryForm>`;

const contentWidthCode = `<ProForm>
  <FormText name="id" label="ID" width={24} />
  <FormText name="name" label="姓名" width={6} />
  <FormSelect name="role" label="角色" width={6} />
  <FormText name="address" label="详细地址" width={28} />
</ProForm>`;

const roleOptions = ["管理员", "编辑", "访客"];

function clampWidth(value: number) {
  return Math.min(MAX_DEMO_WIDTH, Math.max(MIN_DEMO_WIDTH, Math.round(value)));
}

function getBreakpoint(width: number) {
  if (width < 576) return { name: "xs", columns: 1 };
  if (width < 768) return { name: "sm", columns: 2 };
  if (width < 992) return { name: "md", columns: 3 };
  if (width < 1200) return { name: "lg", columns: 3 };
  if (width < 1600) return { name: "xl", columns: 4 };
  return { name: "xxl", columns: 4 };
}

export function BreakpointComparison() {
  const [demoWidth, setDemoWidth] = useState(1440);
  const [stageWidth, setStageWidth] = useState(1000);
  const stageRef = useRef<HTMLDivElement>(null);
  const breakpoint = getBreakpoint(demoWidth);
  const progress = (demoWidth - MIN_DEMO_WIDTH) / (MAX_DEMO_WIDTH - MIN_DEMO_WIDTH);
  const framePercent = MIN_FRAME_PERCENT + progress * (100 - MIN_FRAME_PERCENT);
  const frameStyle = { "--demo-frame-width": `${framePercent}%` } as CSSProperties;
  const formViewportWidth = Math.max(1, stageWidth * (framePercent / 100) - 34);
  const formViewportScale = Math.min(1, formViewportWidth / demoWidth);
  const logicalViewportStyle = {
    "--logical-viewport-width": `${demoWidth}px`,
    "--logical-viewport-scale": formViewportScale,
  } as CSSProperties;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const handleStageResize: ResizeObserverCallback = ([entry]) => {
      if (entry) setStageWidth(entry.contentRect.width);
    };
    const observer = new ResizeObserver(handleStageResize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const updateWidthFromPointer = (clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const physicalProgress = Math.min(
      1,
      Math.max(
        0,
        (clientX - rect.left - rect.width * (MIN_FRAME_PERCENT / 100)) /
          (rect.width * (1 - MIN_FRAME_PERCENT / 100)),
      ),
    );
    setDemoWidth(clampWidth(MIN_DEMO_WIDTH + physicalProgress * (MAX_DEMO_WIDTH - MIN_DEMO_WIDTH)));
  };

  const handleResizeStart = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateWidthFromPointer(event.clientX);
  };

  const handleResizeMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateWidthFromPointer(event.clientX);
    }
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setDemoWidth((width) => clampWidth(width + direction * HANDLE_KEY_STEP));
  };

  return (
    <section className={styles.responsiveDemo} aria-labelledby="responsive-title">
      <div className={styles.responsiveHeading}>
        <div>
          <h3 id="responsive-title">拖动右边缘，从 375px 看向 4K</h3>
          <p>
            上方按 Ant Design 的断点与 span 配置模拟列宽，下方直接描述内容需要多少字符。拖到 1600px
            以后，前者会长期停在 <code>xxl</code>；屏幕继续变宽，短字段和长字段仍然平分空间。
          </p>
          <p className={styles.breakpointSourceNote}>
            断点位置定义在 Ant Design 的 <code>theme/util/alias.js</code>
            ：480、576、768、992、1200、 1600、1920 被生成成 <code>screenXS</code>—
            <code>screenXXXL</code> 及对应的 Min / Max Token；
            <code>grid/style/index.js</code> 再把它们编译成媒体查询，Pro Components 的
            <code> form/layouts/QueryFilter/index.js</code> 也读取同一组 Token。<code>span</code>
            只能规定每个已命名区间占几格，不能为单个表单改区间起点。技术上可以通过 ConfigProvider
            全局覆盖整组 <code>screen*</code> Token，但必须同时维护 Min / Max
            的顺序关系，并会改变全站所有响应式组件； 因此它并不是一个可安全局部调整的 QueryForm
            配置。
          </p>
        </div>
        <div className={styles.widthReadout} aria-live="polite">
          <strong>{demoWidth}px</strong>
          <Tag color={breakpoint.name === "xxl" ? "orange" : "default"}>
            {breakpoint.name} · {breakpoint.columns} 列
          </Tag>
        </div>
      </div>

      <div className={styles.resizeStage} ref={stageRef}>
        <div className={styles.resizeFrame} style={frameStyle}>
          <div className={styles.demoLayer}>
            <div className={styles.layerLabel}>
              <span>Pro Query Form</span>
              <code>xs=24 sm=12 md=8 lg=8 xl=6 xxl=6</code>
            </div>
            <div className={styles.logicalFormViewport} style={logicalViewportStyle}>
              <ProQueryForm span={queryFormSpan} submitter={false}>
                <AntProFormText
                  name="gridId"
                  label="ID"
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                />
                <AntProFormText name="gridName" label="姓名" placeholder="张三" />
                <AntProFormSelect
                  name="gridRole"
                  label="角色"
                  options={roleOptions}
                  placeholder="管理员"
                />
                <AntProFormText
                  name="gridAddress"
                  label="详细地址"
                  placeholder="北京市朝阳区望京东路 6 号望京国际研发园 A 座 1208 室"
                />
              </ProQueryForm>
            </div>
          </div>

          <div className={`${styles.demoLayer} ${styles.contentWidthLayer}`}>
            <div className={styles.layerLabel}>
              <span>内容宽度系统</span>
              <code>width / labelWidth（字符）</code>
            </div>
            <div className={styles.logicalFormViewport} style={logicalViewportStyle}>
              <ProForm submitter={false} className={styles.contentWidthForm}>
                <FormText
                  name="contentId"
                  label="ID"
                  width={24}
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                />
                <FormText name="contentName" label="姓名" width={6} placeholder="张三" />
                <FormSelect
                  name="contentRole"
                  label="角色"
                  width={6}
                  options={roleOptions}
                  placeholder="管理员"
                />
                <FormText
                  name="contentAddress"
                  label="详细地址"
                  width={28}
                  placeholder="北京市朝阳区望京东路 6 号望京国际研发园 A 座 1208 室"
                />
              </ProForm>
            </div>
          </div>

          <button
            type="button"
            className={styles.resizeHandle}
            aria-label="调整模拟视口宽度"
            aria-valuemin={MIN_DEMO_WIDTH}
            aria-valuemax={MAX_DEMO_WIDTH}
            aria-valuenow={demoWidth}
            role="slider"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onKeyDown={handleResizeKeyDown}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.comparisonColumns}>
        <ExpandableCode code={breakpointCode} title="展开 ProQueryForm 完整代码" />
        <ExpandableCode code={contentWidthCode} title="展开内容宽度代码" />
      </div>
    </section>
  );
}
