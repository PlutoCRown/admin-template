/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  /** 设为 `true` 时用浏览器内 Mock 顶替独立后端（GitHub Pages 等静态托管）。 */
  readonly VITE_STATIC_MOCK?: string;
}
