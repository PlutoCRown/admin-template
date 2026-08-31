import { Elysia } from "elysia";
import { ApiError, ErrorCode } from "./codes";
import { MOCK_HOST, MOCK_PORT } from "./config";
import { randomDelay } from "./delay";
import { fail } from "./envelope";
import { apiRoutes } from "./routes";

const app = new Elysia()
  .error({ ApiError })
  .onError(({ code, error, set }) => {
    if (error instanceof ApiError) {
      set.status = error.status;
      return fail(error.code, error.message);
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return fail(ErrorCode.BAD_REQUEST, "参数校验失败");
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return fail(ErrorCode.NOT_FOUND, "接口不存在");
    }
    set.status = 500;
    const message = error instanceof Error ? error.message : "服务器错误";
    return fail(ErrorCode.INTERNAL, message);
  })
  .onRequest(({ request }) => {
    const path = new URL(request.url).pathname;
    if (path === "/health") {
      return;
    }
    return randomDelay();
  })
  .get("/health", () => ({ ok: true }))
  .use(apiRoutes)
  .listen({
    hostname: MOCK_HOST,
    port: MOCK_PORT,
  });

console.log(`mock server  http://${MOCK_HOST}:${MOCK_PORT}`);

export type MockApp = typeof app;
