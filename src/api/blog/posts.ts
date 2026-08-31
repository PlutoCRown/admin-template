import { request } from "#api/base/client";
import type { PageResult } from "#api/base/types";
import type { BlogPost, BlogPostPayload, BlogPostQuery } from "./types";

export type { BlogPost, BlogPostPayload, BlogPostQuery, BlogPostStatus } from "./types";

export function getBlogPostListApi(params: BlogPostQuery) {
  return request.get<PageResult<BlogPost>>("/posts", params);
}

export function getBlogPostApi(id: string) {
  return request.get<BlogPost>(`/posts/${id}`);
}

export function createBlogPostApi(payload: BlogPostPayload) {
  return request.post<BlogPost, BlogPostPayload>("/posts", payload);
}

export function updateBlogPostApi(id: string, payload: BlogPostPayload) {
  return request.put<BlogPost, BlogPostPayload>(`/posts/${id}`, payload);
}

export function deleteBlogPostApi(id: string) {
  return request.delete<boolean>(`/posts/${id}`);
}
