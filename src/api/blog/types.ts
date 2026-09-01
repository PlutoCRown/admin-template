import type { PageQuery } from "#api/base/types";

export type BlogPostStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: BlogPostStatus;
  updatedAt: string;
}

export interface BlogPostQuery extends PageQuery {
  status?: BlogPostStatus;
}

export interface BlogPostPayload {
  title: string;
  summary?: string;
  content?: string;
  status: BlogPostStatus;
}
