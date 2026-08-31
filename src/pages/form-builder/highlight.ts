import { createHighlighter, type BundledLanguage } from "shiki";
import { escapeHtml } from "#utils/escape-html";

const LANGUAGE_MAP: Record<string, BundledLanguage> = {
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  json: "json",
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["github-dark"],
    langs: ["tsx", "typescript", "json"],
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
