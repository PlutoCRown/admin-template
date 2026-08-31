import { ApiError, ErrorCode } from "./codes";
import { users } from "./data";
import type { UserProfile } from "../src/api/login/types";

const tokens = new Map<string, string>();

export function issueToken(username: string): string {
  const token = `mock_${username}_${Date.now()}`;
  tokens.set(token, username);
  return token;
}

export function revokeToken(token: string | undefined) {
  if (token) {
    tokens.delete(token);
  }
}

function usernameFromToken(token: string): string | undefined {
  const issued = tokens.get(token);
  if (issued) {
    return issued;
  }
  const matched = /^mock_(.+)_(\d+)$/.exec(token);
  const username = matched?.[1];
  if (!username || !users.some((item) => item.username === username)) {
    return undefined;
  }
  tokens.set(token, username);
  return username;
}

export function userFromAuthorization(authorization: string | undefined): UserProfile | undefined {
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return undefined;
  }
  const username = usernameFromToken(token);
  return users.find((item) => item.username === username);
}

export function requireUser(authorization: string | undefined): UserProfile {
  const user = userFromAuthorization(authorization);
  if (!user) {
    throw new ApiError(ErrorCode.UNAUTHORIZED, "未登录或登录已过期");
  }
  return user;
}

export function bearerToken(authorization: string | undefined): string | undefined {
  const token = authorization?.replace(/^Bearer\s+/i, "");
  return token || undefined;
}
