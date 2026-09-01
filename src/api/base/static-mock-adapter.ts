import type { BlogPost, BlogPostPayload } from "#api/blog/types";
import type { LoginPayload } from "#api/login/types";
import type { ProductPayload } from "#api/media/types";
import type { Staff, StaffPayload } from "#api/pro/types";
import { ApiError, ErrorCode } from "../../../mock/codes";
import {
  articles,
  fileToMedia,
  getStaffAvatar,
  passwords,
  posts,
  products,
  staff,
  users,
} from "../../../mock/data";
import { resolvePostContent } from "../../../mock/sample-content";
import { issueToken, requireUser, revokeToken } from "../../../mock/auth";
import { fail, ok, paginate } from "../../../mock/envelope";
import {
  HttpError,
  type HttpAdapter,
  type HttpResponse,
  type ResolvedHttpRequestConfig,
} from "./http";

let staffRows: Staff[] = staff.map((item) => ({ ...item }));
let articleRows = articles.map((item) => ({ ...item }));
let productRows = products.map((item) => ({ ...item }));
let postRows: BlogPost[] = posts.map((item) => ({ ...item }));
let staffSeq = staffRows.length;
let productSeq = 0;
let fileSeq = 0;
let postSeq = postRows.length;

function postSummary(title: string, content: string, summary?: string) {
  if (summary?.trim()) {
    return summary.trim();
  }
  const line = content.split("\n").find((item) => {
    const text = item.trim();
    return text && !text.startsWith("#") && !text.startsWith("<");
  });
  return (line ?? title).trim().slice(0, 80);
}

function queryValue(params: object | undefined, key: string): string {
  if (!params) {
    return "";
  }
  const value = (params as Record<string, unknown>)[key];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function queryNumber(params: object | undefined, key: string, fallback: number): number {
  const raw = queryValue(params, key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function pathnameOf(config: ResolvedHttpRequestConfig): string {
  const joined = `${(config.baseURL ?? "/api").replace(/\/+$/, "")}/${config.url.replace(/^\/+/, "")}`;
  return new URL(joined, "https://pages.local").pathname.replace(/\/+$/, "") || "/";
}

function okResponse<T>(config: ResolvedHttpRequestConfig, data: T): HttpResponse {
  return {
    data: ok(data),
    status: 200,
    statusText: "OK",
    headers: new Headers({ "Content-Type": "application/json" }),
    config,
  };
}

function throwApiError(config: ResolvedHttpRequestConfig, error: ApiError): never {
  const data = fail(error.code, error.message);
  throw new HttpError({
    message: error.message,
    config,
    code: "ERR_BAD_RESPONSE",
    status: error.status,
    data,
    response: {
      data,
      status: error.status,
      statusText: error.message,
      headers: new Headers({ "Content-Type": "application/json" }),
      config,
    },
  });
}

function match(pathname: string, pattern: string): Record<string, string> | null {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (const [index, part] of patternParts.entries()) {
    const actual = pathParts[index];
    if (actual === undefined) {
      return null;
    }
    if (part.startsWith(":")) {
      params[part.slice(1)] = decodeURIComponent(actual);
      continue;
    }
    if (part !== actual) {
      return null;
    }
  }
  return params;
}

async function handle(config: ResolvedHttpRequestConfig): Promise<unknown> {
  const pathname = pathnameOf(config);
  const method = config.method;
  const authorization = config.headers.Authorization ?? config.headers.authorization;

  if (method === "POST" && match(pathname, "/api/auth/login")) {
    const body = (config.data ?? {}) as LoginPayload;
    const user = users.find((item) => item.username === body.username);
    if (!user || passwords[body.username] !== body.password) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "账号或密码错误");
    }
    return {
      token: issueToken(user.username),
      expiresIn: 7200,
      user,
    };
  }

  if (method === "POST" && match(pathname, "/api/auth/logout")) {
    revokeToken(authorization?.replace(/^Bearer\s+/i, ""));
    return true;
  }

  const publicPost = match(pathname, "/api/posts/:id");
  if (publicPost && method === "GET") {
    const item = postRows.find((entry) => entry.id === publicPost.id);
    if (!item) {
      throw new ApiError(ErrorCode.NOT_FOUND, "内容不存在");
    }
    return item;
  }

  const user = requireUser(authorization);

  if (method === "GET" && match(pathname, "/api/auth/profile")) {
    return user;
  }

  if (method === "GET" && match(pathname, "/api/staff")) {
    const keyword = queryValue(config.params, "keyword").trim();
    const department = queryValue(config.params, "department");
    const role = queryValue(config.params, "role");
    const status = queryValue(config.params, "status");
    const filtered = staffRows.filter((item) => {
      const keywordHit = !keyword || item.name.includes(keyword) || item.email.includes(keyword);
      return (
        keywordHit &&
        (!department || item.department === department) &&
        (!role || item.role === role) &&
        (!status || item.status === status)
      );
    });
    return paginate(
      filtered,
      queryNumber(config.params, "page", 1),
      queryNumber(config.params, "pageSize", 10),
    );
  }

  const staffOne = match(pathname, "/api/staff/:id");
  if (staffOne && method === "GET") {
    const item = staffRows.find((entry) => entry.id === staffOne.id);
    if (!item) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    return item;
  }
  if (method === "POST" && match(pathname, "/api/staff")) {
    staffSeq += 1;
    const payload = config.data as StaffPayload;
    const item: Staff = {
      ...payload,
      id: `staff_${staffSeq}`,
      avatar: getStaffAvatar(staffSeq, payload.name),
      createdAt: new Date().toISOString(),
      salary: 120000,
    };
    staffRows = [item, ...staffRows];
    return item;
  }
  if (staffOne && method === "PUT") {
    const index = staffRows.findIndex((entry) => entry.id === staffOne.id);
    const current = staffRows[index];
    if (index < 0 || !current) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    const next = { ...current, ...(config.data as StaffPayload) };
    staffRows = staffRows.map((entry, entryIndex) => (entryIndex === index ? next : entry));
    return next;
  }
  if (staffOne && method === "DELETE") {
    const index = staffRows.findIndex((entry) => entry.id === staffOne.id);
    if (index < 0) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    staffRows = staffRows.filter((_, entryIndex) => entryIndex !== index);
    return true;
  }

  if (method === "GET" && match(pathname, "/api/posts")) {
    const keyword = queryValue(config.params, "keyword").trim();
    const status = queryValue(config.params, "status");
    const filtered = postRows.filter((item) => {
      const keywordHit = !keyword || item.title.includes(keyword) || item.summary.includes(keyword);
      return keywordHit && (!status || item.status === status);
    });
    return paginate(
      filtered,
      queryNumber(config.params, "page", 1),
      queryNumber(config.params, "pageSize", 10),
    );
  }

  if (method === "POST" && match(pathname, "/api/posts")) {
    postSeq += 1;
    const payload = config.data as BlogPostPayload;
    const content = resolvePostContent(payload.content);
    const item: BlogPost = {
      id: `post_${postSeq}`,
      title: payload.title,
      summary: postSummary(payload.title, content, payload.summary),
      content,
      status: payload.status,
      updatedAt: new Date().toISOString(),
    };
    postRows = [item, ...postRows];
    return item;
  }

  const postOne = match(pathname, "/api/posts/:id");
  if (postOne && method === "PUT") {
    const index = postRows.findIndex((entry) => entry.id === postOne.id);
    const current = postRows[index];
    if (index < 0 || !current) {
      throw new ApiError(ErrorCode.NOT_FOUND, "内容不存在");
    }
    const payload = config.data as BlogPostPayload;
    const content = payload.content ?? current.content;
    const next: BlogPost = {
      ...current,
      title: payload.title,
      content,
      status: payload.status,
      summary: postSummary(payload.title, content, payload.summary),
      updatedAt: new Date().toISOString(),
    };
    postRows = postRows.map((entry, entryIndex) => (entryIndex === index ? next : entry));
    return next;
  }
  if (postOne && method === "DELETE") {
    const index = postRows.findIndex((entry) => entry.id === postOne.id);
    if (index < 0) {
      throw new ApiError(ErrorCode.NOT_FOUND, "内容不存在");
    }
    postRows = postRows.filter((_, entryIndex) => entryIndex !== index);
    return true;
  }

  if (method === "GET" && match(pathname, "/api/articles")) {
    const keyword = queryValue(config.params, "keyword").trim();
    const status = queryValue(config.params, "status");
    const filtered = articleRows.filter((item) => {
      const keywordHit = !keyword || item.title.includes(keyword) || item.summary.includes(keyword);
      return keywordHit && (!status || item.status === status);
    });
    return paginate(
      filtered,
      queryNumber(config.params, "page", 1),
      queryNumber(config.params, "pageSize", 8),
    );
  }

  const articleOne = match(pathname, "/api/articles/:id");
  if (articleOne && method === "GET") {
    const item = articleRows.find((entry) => entry.id === articleOne.id);
    if (!item) {
      throw new ApiError(ErrorCode.NOT_FOUND, "内容不存在");
    }
    return item;
  }

  if (method === "POST" && match(pathname, "/api/upload")) {
    const data = config.data;
    const file = data instanceof FormData ? data.get("file") : undefined;
    if (!(file instanceof File)) {
      throw new ApiError(ErrorCode.BAD_REQUEST, "参数校验失败");
    }
    fileSeq += 1;
    return fileToMedia(file, `file_${fileSeq}`);
  }

  if (method === "POST" && match(pathname, "/api/products")) {
    productSeq += 1;
    const payload = config.data as ProductPayload;
    const item = {
      ...payload,
      id: `product_${productSeq}`,
      createdAt: new Date().toISOString(),
    };
    productRows = [item, ...productRows];
    return item;
  }

  throw new ApiError(ErrorCode.NOT_FOUND, "接口不存在");
}

/** GitHub Pages 等纯静态托管没有 Mock 进程时，在浏览器内承接同一套演示接口。 */
export const staticMockAdapter: HttpAdapter = async (config) => {
  try {
    const data = await handle(config);
    return okResponse(config, data);
  } catch (error) {
    if (error instanceof ApiError) {
      throwApiError(config, error);
    }
    throw error;
  }
};
