/** Vite `BASE_URL` 带尾斜杠；React Router `basename` 除根路径外不带。 */
export function getRouterBasename(): string {
  const base = import.meta.env.BASE_URL;
  if (!base || base === "/") {
    return "/";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/** 把应用内路径拼到部署子路径上，供 `window.location` 等无法感知 Router basename 的 API 使用。 */
export function withBasePath(path: string): string {
  const basename = getRouterBasename();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (basename === "/") {
    return normalized;
  }
  return `${basename}${normalized}`;
}
