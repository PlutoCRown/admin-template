import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import { mockProxy, mockServerReminder } from "./mock/config";

function resolveBase(): string {
  const fromEnv = process.env.VITE_BASE_PATH;
  if (!fromEnv) {
    return "/";
  }
  return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
}

export default defineConfig({
  base: resolveBase(),
  plugins: lazyPlugins(() => [mockServerReminder(), react({ compiler: true })]),
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
    ignorePatterns: ["dist/**", "node_modules/**", "bun.lock", "vite.config.ts", "mock/**"],
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
