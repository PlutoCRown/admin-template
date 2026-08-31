export const MOCK_HOST = "127.0.0.1";
export const MOCK_PORT = Number(process.env.MOCK_PORT || 3001);
export const MOCK_ORIGIN = `http://${MOCK_HOST}:${MOCK_PORT}`;

const MOCK_START_HINT = "\n[mock] 模拟后端未启动。可另开终端执行：\n  bun run mock\n";

let lastMockWarn = 0;

function warnMockDown() {
  const now = Date.now();
  if (now - lastMockWarn < 8000) {
    return;
  }
  lastMockWarn = now;
  console.warn(MOCK_START_HINT);
}

export function mockServerReminder() {
  return {
    name: "mock-reminder",
    apply: "serve" as const,
    async configureServer() {
      try {
        const response = await fetch(`${MOCK_ORIGIN}/health`, {
          signal: AbortSignal.timeout(800),
        });
        if (!response.ok) {
          warnMockDown();
        }
      } catch {
        warnMockDown();
      }
    },
  };
}

export const mockProxy = {
  "/api": {
    target: MOCK_ORIGIN,
    changeOrigin: true,
    configure(proxy: { on: (event: string, listener: () => void) => void }) {
      proxy.on("error", warnMockDown);
    },
  },
};
