import { getBlogPostApi, type BlogPost } from "#api/blog/posts";

export type BlogPostLoadResult = { ok: true; post: BlogPost } | { ok: false };

const cache = new Map<string, Promise<BlogPostLoadResult>>();

export function readBlogPost(id: string): Promise<BlogPostLoadResult> {
  const cached = cache.get(id);
  if (cached) {
    return cached;
  }
  const next = getBlogPostApi(id).then(
    (post) => ({ ok: true as const, post }),
    () => ({ ok: false as const }),
  );
  cache.set(id, next);
  return next;
}

export function writeBlogPostCache(post: BlogPost) {
  cache.set(post.id, Promise.resolve({ ok: true, post }));
}
