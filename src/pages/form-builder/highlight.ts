import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);

const LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  json: "json",
};

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function highlightCode(value: string, language: string) {
  const resolved = LANGUAGE_MAP[language];
  if (!resolved) {
    return escapeHtml(value);
  }
  return hljs.highlight(value, { language: resolved }).value;
}
