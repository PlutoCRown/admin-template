# 后台模板约定

本仓库是中后台 **模板**，不是最终业务项目。改代码前先分清：这是给后续项目复用的能力，还是 demo 页里的一次性东西。

## 1. 可复用 vs 演示

拉下来之后，`src/pages` 一般会删掉换成自己的业务页。**当前 pages 均为 demo**，不要把页面结构、样式、专用 store 当成要长期维护的产品代码。

**可复用（优先改、优先引用）：**

- `src/components/**`：`form`、`pro-table`、`page-container`、`sortable-upload` 等
- `src/layouts/**`、路由守卫、`src/styles/global.css`
- 横切能力：`src/stores/user.ts`、`src/stores/global-config.ts`、`src/api/base/**`、`src/hooks/**`

**演示（可整页替换，不要往这里堆可复用 UI）：**

- `src/pages/**`（form-builder、pro 示例、dashboard、media 等）
- 只服务演示页的代码，如 `src/stores/form-builder.ts`、`src/constants/demo.ts`

只有明确要给后续业务复用的 UI，才放进 `components`。

## 2. 样式

- **components**：普通 CSS，与组件同目录，用稳定 class 前缀（如 `.ch-form`、`.ch-text-list`）封装，开箱即用，消费方不应再配一套样式才能用。
- **pages**：用 CSS Modules（`*.module.css`），避免全局 class 污染；页面样式不要写进 `components` 或 `global.css`。

## 3. 文件组织

尽可能 **一文件一个 React 组件**。仅限真正的小组件（图标按钮、无状态一行 UI）可以和父组件放在同一文件。

## 4. 少写样式，先问再抽象

后台应主要靠 antd / Pro Components / 已有 form、table 封装，而不是堆定制 CSS。

除非该组件本身就是高度定制的视觉件，否则不要在 form、table 这类通用能力上堆大量一次性样式。如果正在为某个业务场景深度定制 form / table，**先问用户要不要抽到 `components`**，不要默默在 page 里写一大坨 CSS。
