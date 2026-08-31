export interface BlogPreviewPayload {
  title: string;
  content: string;
}

function storageKey(id: string) {
  return `blog-preview:${id}`;
}

export function writeBlogPreview(id: string, payload: BlogPreviewPayload) {
  sessionStorage.setItem(storageKey(id), JSON.stringify(payload));
}

export function readBlogPreview(id: string): BlogPreviewPayload | null {
  const raw = sessionStorage.getItem(storageKey(id));
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "title" in parsed &&
      "content" in parsed &&
      typeof parsed.title === "string" &&
      typeof parsed.content === "string"
    ) {
      return { title: parsed.title, content: parsed.content };
    }
  } catch {
    return null;
  }
  return null;
}
