import { request } from "./client";
import type { MediaFile, Product, ProductPayload } from "./types";

export function uploadFileApi(file: File) {
  const data = new FormData();
  data.append("file", file);
  return request.post<MediaFile, FormData>("/upload", data);
}

export function createProductApi(payload: ProductPayload) {
  return request.post<Product, ProductPayload>("/products", payload);
}
