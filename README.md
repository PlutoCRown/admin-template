# Admin Template

面向现代中后台的 React 模板：少写样式、用好 Pro Components，并补齐 Ant Design 表单在宽度与对齐上的短板。

适合作为新项目的起点，也方便后端同学用 vibecoding 直接搭管理端，而不被历史前端债务拖住。

## 为什么做这个项目

1. **断点与展示宽度**：antd 默认样式断点偏旧，复杂后台里很难把「该多宽」控制得舒服。
2. **表单宽度与对齐**：Text / Select 等相似控件的宽度管理混乱；label 宽度与单行 inline 对齐更是痛点。本模板用自研 `ch-form` 封装（字符宽度、`block`、gap 间距）统一处理。
3. **Pro Components 被低估**：很多人只知 antd，或只用 ProTable，忽略了 ProForm / ProList / SchemaForm / ProDescriptions 等能力。
4. **多维表格时代**：后台越来越习惯在表内直接编辑，而不是只靠行末 Action。
5. **给 vibecoding 的干净底板**：提供现代依赖与约定，减少「从旧项目抄一套」的成本。
6. **少写样式**：预制布局、表单、上传排序、主题设置等，业务侧尽量聚焦数据与交互。

## 技术栈

| 类别            | 选型                                    |
| --------------- | --------------------------------------- |
| 运行时 / 包管理 | [Bun](https://bun.sh)                   |
| 框架            | React 19、React Router 8                |
| UI              | Ant Design 6、Ant Design Pro Components |
| 构建            | Vite Plus（`vp`）                       |
| 状态            | Zustand + Immer（含 persist）           |
| 拖拽            | dnd-kit                                 |
| Mock            | Elysia（`mock-server`）                 |
| 其它            | dayjs、es-toolkit、shiki（代码高亮）    |

路径别名：`#*` → `./src/*`（例如 `#components/form`）。

## 特性一览

- **封装表单 `ProForm` / `FormText` 等**：按「方块字符」控制控件与 label 宽度，支持 `block` 整行；用 `row-gap` / `column-gap` 替代 item `margin-bottom`，同行垂直居中，并随 Form `size`（small / middle / large）缩放。
- **表单生成器**：可视化配字段与表单设置，实时预览，导出 TSX / 类型 / JSON Schema 等；状态持久化在本地。
- **Pro 组件示例**：ProTable、ProForm、ProList、SchemaForm、ProDescriptions。
- **可排序上传**：媒体图册等场景的拖拽排序上传。
- **个性化设置**：浅色 / 深色 / 跟随系统；侧边菜单支持显示开关、分级拖拽排序与一键重置，设置会在本地持久化。
- **超椭圆圆角**：Chromium 下通过 `corner-shape: squircle` 渐进增强（配合调大后的 `borderRadius` token）。
- **鉴权骨架**：登录页、路由守卫、Zustand 用户态。

## 快速开始

需要 Bun ≥ 1.4。

```bash
# 安装依赖
bun install

# 终端 1：Mock 后端（默认 http://127.0.0.1:3001）
bun run mock

# 终端 2：前端开发服务
bun run dev
```

浏览器打开终端里提示的本地地址（多为 `http://localhost:5173`）。

### 演示账号

| 角色   | 用户名   | 密码        |
| ------ | -------- | ----------- |
| 管理员 | `admin`  | `admin123`  |
| 编辑   | `editor` | `editor123` |

## 常用脚本

```bash
bun run dev        # 开发
bun run mock       # Mock API
bun run build      # 生产构建
bun run preview    # 预览构建产物
bun run check      # 类型 / 规范检查
bun run lint       # Lint
bun run fmt        # 格式化
```

## 目录结构

```text
admin-template/
├── mock-server/          # Elysia Mock API
├── src/
│   ├── api/              # base 请求封装 + 按 pages 镜像的接口
│   ├── components/       # 通用组件（form、pro-table、sortable-upload…）
│   ├── hooks/
│   ├── layouts/          # 侧栏布局、账号栏
│   ├── pages/            # 页面（dashboard、form-builder、pro、media、settings…）
│   ├── router/           # 路由、菜单、鉴权
│   ├── stores/           # Zustand（user / global-config / form-builder）
│   ├── styles/           # 全局样式（含 corner-shape 等）
│   └── App.tsx
├── package.json
└── vite.config.ts
```

## 页面导航

| 路径                | 说明                   |
| ------------------- | ---------------------- |
| `/dashboard`        | 工作台                 |
| `/form-builder`     | 表单生成器             |
| `/pro/table`        | ProTable               |
| `/pro/form`         | ProForm                |
| `/pro/list`         | ProList                |
| `/pro/schema-form`  | SchemaForm             |
| `/pro/descriptions` | ProDescriptions        |
| `/media`            | 媒体图册（可排序上传） |

## 表单封装（简要）

业务里优先使用 `#components/form`：

```tsx
import { FormText, FormSelect, ProForm } from "#components/form";

<ProForm labelWidth={4} colon={false} onFinish={handleSubmit}>
  <FormText name="name" label="姓名" width={8} rules={[{ required: true }]} />
  <FormSelect name="role" label="角色" width={10} options={["管理员", "编辑"]} />
</ProForm>;
```

- `width` / `labelWidth`：单位为方块字符（约 `1em`）
- `block`：表单项占整行（输入类拉满；Switch / Segmented 仍按内容宽度）
- Form `size`：影响表单行/列 gap（small / middle / large）

更多可对照 `src/pages/pro/form.tsx` 与 `src/pages/form-builder`。

## License

Private template — 按团队约定使用与分发。
