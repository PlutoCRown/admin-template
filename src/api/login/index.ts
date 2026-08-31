import { request } from "#api/base/client";
import type { LoginPayload, LoginResult, UserProfile } from "./types";

export type { LoginPayload, LoginResult, UserProfile } from "./types";

export function loginApi(payload: LoginPayload) {
  return request.post<LoginResult, LoginPayload>("/auth/login", payload);
}

export function logoutApi() {
  return request.post<boolean>("/auth/logout");
}

export function getProfileApi() {
  return request.get<UserProfile>("/auth/profile");
}
