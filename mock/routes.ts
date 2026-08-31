import { Elysia, t } from "elysia";
import type { ProductPayload } from "../src/api/media/types";
import type { StaffPayload } from "../src/api/pro/types";
import { bearerToken, issueToken, requireUser, revokeToken } from "./auth";
import { ApiError, ErrorCode } from "./codes";
import { articles, fileToMedia, getStaffAvatar, passwords, products, staff, users } from "./data";
import { ok, paginate } from "./envelope";

let staffSeq = staff.length;
let productSeq = 0;
let fileSeq = 0;

const publicRoutes = new Elysia()
  .post(
    "/auth/login",
    ({ body }) => {
      const user = users.find((item) => item.username === body.username);
      if (!user || passwords[body.username] !== body.password) {
        throw new ApiError(ErrorCode.UNAUTHORIZED, "账号或密码错误");
      }
      return ok({
        token: issueToken(user.username),
        expiresIn: 7200,
        user,
      });
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .post("/auth/logout", ({ headers }) => {
    revokeToken(bearerToken(headers.authorization));
    return ok(true);
  });

const privateRoutes = new Elysia()
  .derive(({ headers }) => ({
    currentUser: requireUser(headers.authorization),
  }))
  .get("/auth/profile", ({ currentUser }) => ok(currentUser))
  .get("/staff", ({ query }) => {
    const keyword = String(query.keyword ?? "").trim();
    const filtered = staff.filter((item) => {
      const keywordHit = !keyword || item.name.includes(keyword) || item.email.includes(keyword);
      const departmentHit = !query.department || item.department === query.department;
      const roleHit = !query.role || item.role === query.role;
      const statusHit = !query.status || item.status === query.status;
      return keywordHit && departmentHit && roleHit && statusHit;
    });
    return ok(paginate(filtered, Number(query.page ?? 1), Number(query.pageSize ?? 10)));
  })
  .get("/staff/:id", ({ params }) => {
    const item = staff.find((entry) => entry.id === params.id);
    if (!item) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    return ok(item);
  })
  .post("/staff", ({ body }) => {
    staffSeq += 1;
    const payload = body as StaffPayload;
    const item = {
      ...payload,
      id: `staff_${staffSeq}`,
      avatar: getStaffAvatar(staffSeq, payload.name),
      createdAt: new Date().toISOString(),
      salary: 120000,
    };
    staff.unshift(item);
    return ok(item);
  })
  .put("/staff/:id", ({ params, body }) => {
    const index = staff.findIndex((entry) => entry.id === params.id);
    const current = staff[index];
    if (index < 0 || !current) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    const next = { ...current, ...(body as StaffPayload) };
    staff[index] = next;
    return ok(next);
  })
  .delete("/staff/:id", ({ params }) => {
    const index = staff.findIndex((entry) => entry.id === params.id);
    if (index < 0) {
      throw new ApiError(ErrorCode.NOT_FOUND, "员工不存在");
    }
    staff.splice(index, 1);
    return ok(true);
  })
  .get("/articles", ({ query }) => {
    const keyword = String(query.keyword ?? "").trim();
    const filtered = articles.filter((item) => {
      const keywordHit = !keyword || item.title.includes(keyword) || item.summary.includes(keyword);
      const statusHit = !query.status || item.status === query.status;
      return keywordHit && statusHit;
    });
    return ok(paginate(filtered, Number(query.page ?? 1), Number(query.pageSize ?? 8)));
  })
  .get("/articles/:id", ({ params }) => {
    const item = articles.find((entry) => entry.id === params.id);
    if (!item) {
      throw new ApiError(ErrorCode.NOT_FOUND, "内容不存在");
    }
    return ok(item);
  })
  .post(
    "/upload",
    async ({ body }) => {
      fileSeq += 1;
      const media = await fileToMedia(body.file, `file_${fileSeq}`);
      return ok(media);
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    },
  )
  .post("/products", ({ body }) => {
    productSeq += 1;
    const payload = body as ProductPayload;
    const item = {
      ...payload,
      id: `product_${productSeq}`,
      createdAt: new Date().toISOString(),
    };
    products.unshift(item);
    return ok(item);
  });

export const apiRoutes = new Elysia({ prefix: "/api" }).use(publicRoutes).guard(
  {
    beforeHandle({ headers }) {
      requireUser(headers.authorization);
    },
  },
  (app) => app.use(privateRoutes),
);
