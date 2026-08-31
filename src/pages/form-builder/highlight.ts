import json from "@shikijs/langs/json";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import githubDark from "@shikijs/themes/github-dark";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { escapeHtml } from "#utils/escape-html";

type HighlightLanguage = "json" | "tsx" | "typescript";

const LANGUAGE_MAP: Record<string, HighlightLanguage> = {
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  json: "json",
};

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubDark],
    langs: [tsx, typescript, json],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

export async function highlightCode(value: string, language: string) {
  const resolved = LANGUAGE_MAP[language];
  if (!resolved) {
    return escapeHtml(value);
  }
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(value, {
    lang: resolved,
    theme: "github-dark",
    structure: "inline",
  });
}
