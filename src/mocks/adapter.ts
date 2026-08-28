import { delay } from "es-toolkit";
import {
  buildMockResponse,
  HttpError,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from "#api/http";
import type {
  ApiEnvelope,
  Article,
  ArticleQuery,
  LoginPayload,
  MediaFile,
  PageResult,
  Product,
  ProductPayload,
  Staff,
  StaffPayload,
  StaffQuery,
  UserProfile,
} from "#api/types";
import { articles, fileToMedia, paginate, passwords, products, staff, tokens, users } from "./data";

function ok<T>(data: T, message = "ok"): ApiEnvelope<T> {
  return { code: 0, message, data };
}

function fail(message: string, code = 400): ApiEnvelope<null> {
  return { code, message, data: null };
}

function pathnameOf(config: HttpRequestConfig): string {
  const raw = config.url ?? "";
  const withoutQuery = raw.split("?")[0] ?? "";
  return withoutQuery.replace(/^\/api/, "") || "/";
}

function match(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (const [index, part] of patternParts.entries()) {
    const current = pathParts[index];
    if (part.startsWith(":")) {
      if (!current) {
        return null;
      }
      params[part.slice(1)] = current;
      continue;
    }
    if (part !== current) {
      return null;
    }
  }
  return params;
}

function getAuthUser(config: HttpRequestConfig): UserProfile | undefined {
  const token = config.headers?.Authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return undefined;
  }
  const username = tokens.get(token);
  return users.find((item) => item.username === username);
}

function queryOf(config: HttpRequestConfig): Record<string, unknown> {
  return { ...(config.params as Record<string, unknown> | undefined) };
}

function bodyOf<T>(config: HttpRequestConfig): T {
  return (config.data ?? {}) as T;
}

let staffSeq = staff.length;
let productSeq = 0;
let fileSeq = 0;

export const mockAdapter: HttpAdapter = async (config) => {
  await delay(280);
  const method = config.method;
  const path = pathnameOf(config);

  const respond = <T>(body: ApiEnvelope<T>, status = 200): HttpResponse<ApiEnvelope<T>> => {
    if (status >= 400) {
      throw new HttpError({
        message: body.message,
        config,
        code: "ERR_BAD_RESPONSE",
        status,
        data: body,
        response: buildMockResponse(config, body, status, body.message),
      });
    }
    return buildMockResponse(config, body, status);
  };

  if (method === "POST" && match(path, "/auth/login")) {
    const payload = bodyOf<LoginPayload>(config);
    const user = users.find((item) => item.username === payload.username);
    if (!user || passwords[payload.username] !== payload.password) {
      return respond(fail("账号或密码错误", 401), 401);
    }
    const token = `mock_${user.username}_${Date.now()}`;
    tokens.set(token, user.username);
    return respond(ok({ token, expiresIn: 7200, user }));
  }

  if (method === "POST" && match(path, "/auth/logout")) {
    const token = config.headers?.Authorization?.replace(/^Bearer\s+/i, "");
    if (token) {
      tokens.delete(token);
    }
    return respond(ok(true));
  }

  const currentUser = getAuthUser(config);
  if (!currentUser) {
    return respond(fail("未登录或登录已过期", 401), 401);
  }

  if (method === "GET" && match(path, "/auth/profile")) {
    return respond(ok(currentUser));
  }

  if (method === "GET" && match(path, "/staff")) {
    const query = queryOf(config) as StaffQuery;
    const keyword = String(query.keyword ?? "").trim();
    const filtered = staff.filter((item) => {
      const keywordHit = !keyword || item.name.includes(keyword) || item.email.includes(keyword);
      const departmentHit = !query.department || item.department === query.department;
      const roleHit = !query.role || item.role === query.role;
      const statusHit = !query.status || item.status === query.status;
      return keywordHit && departmentHit && roleHit && statusHit;
    });
    return respond(ok(paginate(filtered, Number(query.page ?? 1), Number(query.pageSize ?? 10))));
  }

  const staffDetail = match(path, "/staff/:id");
  if (method === "GET" && staffDetail) {
    const item = staff.find((entry) => entry.id === staffDetail.id);
    return item ? respond(ok(item)) : respond(fail("员工不存在", 404), 404);
  }

  if (method === "POST" && match(path, "/staff")) {
    const payload = bodyOf<StaffPayload>(config);
    staffSeq += 1;
    const item: Staff = {
      ...payload,
      id: `staff_${staffSeq}`,
      createdAt: new Date().toISOString(),
    };
    staff.unshift(item);
    return respond(ok(item), 201);
  }

  if (method === "PUT" && staffDetail) {
    const index = staff.findIndex((entry) => entry.id === staffDetail.id);
    if (index < 0) {
      return respond(fail("员工不存在", 404), 404);
    }
    const current = staff[index];
    if (!current) {
      return respond(fail("员工不存在", 404), 404);
    }
    const next: Staff = { ...current, ...bodyOf<StaffPayload>(config) };
    staff[index] = next;
    return respond(ok(next));
  }

  if (method === "DELETE" && staffDetail) {
    const index = staff.findIndex((entry) => entry.id === staffDetail.id);
    if (index < 0) {
      return respond(fail("员工不存在", 404), 404);
    }
    staff.splice(index, 1);
    return respond(ok(true));
  }

  if (method === "GET" && match(path, "/articles")) {
    const query = queryOf(config) as ArticleQuery;
    const keyword = String(query.keyword ?? "").trim();
    const filtered = articles.filter((item) => {
      const keywordHit = !keyword || item.title.includes(keyword) || item.summary.includes(keyword);
      const statusHit = !query.status || item.status === query.status;
      return keywordHit && statusHit;
    });
    return respond(
      ok<PageResult<Article>>(
        paginate(filtered, Number(query.page ?? 1), Number(query.pageSize ?? 8)),
      ),
    );
  }

  const articleDetail = match(path, "/articles/:id");
  if (method === "GET" && articleDetail) {
    const item = articles.find((entry) => entry.id === articleDetail.id);
    return item ? respond(ok(item)) : respond(fail("内容不存在", 404), 404);
  }

  if (method === "POST" && match(path, "/upload")) {
    const data = config.data;
    if (!(data instanceof FormData)) {
      return respond(fail("请使用 multipart/form-data 上传"), 400);
    }
    const file = data.get("file");
    if (!(file instanceof File)) {
      return respond(fail("缺少文件"), 400);
    }
    fileSeq += 1;
    const media = await fileToMedia(file, `file_${fileSeq}`);
    return respond(ok<MediaFile>(media));
  }

  if (method === "POST" && match(path, "/products")) {
    const payload = bodyOf<ProductPayload>(config);
    productSeq += 1;
    const item: Product = {
      ...payload,
      id: `product_${productSeq}`,
      createdAt: new Date().toISOString(),
    };
    products.unshift(item);
    return respond(ok(item), 201);
  }

  return respond(fail(`未实现的接口 ${method} ${path}`, 404), 404);
};
