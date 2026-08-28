export interface ApiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  roles: string[];
  permissions: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresIn: number;
  user: UserProfile;
}

export type UserStatus = "active" | "disabled";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: "admin" | "editor" | "viewer";
  status: UserStatus;
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

export interface MediaFile {
  uid: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  category: string;
  description?: string;
  gallery: MediaFile[];
}

export interface Product extends ProductPayload {
  id: string;
  createdAt: string;
}

export class BizError extends Error {
  readonly code: number;
  readonly payload?: unknown;

  constructor(message: string, code: number, payload?: unknown) {
    super(message);
    this.name = "BizError";
    this.code = code;
    this.payload = payload;
  }
}
