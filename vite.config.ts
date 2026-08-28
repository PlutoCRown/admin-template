import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

const MOCK_PORT = Number(process.env.MOCK_PORT || 3001);
const MOCK_ORIGIN = `http://127.0.0.1:${MOCK_PORT}`;
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

function mockServerReminder() {
  return {
    name: "mock-server-reminder",
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

const mockProxy = {
  "/api": {
    target: MOCK_ORIGIN,
    changeOrigin: true,
    configure(proxy: { on: (event: string, listener: () => void) => void }) {
      proxy.on("error", warnMockDown);
    },
  },
};

export default defineConfig({
  plugins: lazyPlugins(() => [
    mockServerReminder(),
    react({
      compiler: true,
    }),
  ]),
  server: {
    port: 5173,
    proxy: mockProxy,
  },
  preview: {
    proxy: mockProxy,
  },
  staged: {
    "*.{js,ts,tsx}": "vp lint --fix",
  },
  fmt: {
    printWidth: 100,
    singleQuote: false,
    semi: true,
    trailingComma: "all",
    ignorePatterns: ["dist/**", "node_modules/**", "bun.lock"],
  },
  lint: {
    plugins: ["typescript", "react", "unicorn", "oxc"],
    categories: {
      correctness: "error",
      suspicious: "warn",
    },
    env: {
      browser: true,
    },
    ignorePatterns: ["dist/**", "node_modules/**", "bun.lock", "vite.config.ts", "mock-server/**"],
    rules: {
      "unicorn/filename-case": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unstable-nested-components": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/no-unnecessary-type-parameters": "off",
      "typescript/no-unnecessary-type-conversion": "off",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
});
