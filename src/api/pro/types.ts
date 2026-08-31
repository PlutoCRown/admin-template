import type { PageQuery } from "#api/base/types";

export type UserStatus = "active" | "disabled";

export interface Staff {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  department: string;
  role: "admin" | "editor" | "viewer";
  status: UserStatus;
  salary: number;
  createdAt: string;
}

export interface StaffQuery extends PageQuery {
  department?: string;
  role?: Staff["role"];
  status?: UserStatus;
}

export interface StaffPayload {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: Staff["role"];
  status: UserStatus;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  cover: string;
  author: string;
  tags: string[];
  views: number;
  status: "published" | "draft";
  publishedAt: string;
  content: string;
}

export interface ArticleQuery extends PageQuery {
  status?: Article["status"];
}
