import { request } from "#api/base/client";
import type { PageResult } from "#api/base/types";
import type { Article, ArticleQuery } from "./types";

export type { Article, ArticleQuery } from "./types";

export function getArticleListApi(params: ArticleQuery) {
  return request.get<PageResult<Article>>("/articles", params);
}

export function getArticleApi(id: string) {
  return request.get<Article>(`/articles/${id}`);
}
