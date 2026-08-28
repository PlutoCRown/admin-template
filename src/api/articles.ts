import { request } from "./client";
import type { Article, ArticleQuery, PageResult } from "./types";

export function getArticleListApi(params: ArticleQuery) {
  return request.get<PageResult<Article>>("/articles", params);
}

export function getArticleApi(id: string) {
  return request.get<Article>(`/articles/${id}`);
}
