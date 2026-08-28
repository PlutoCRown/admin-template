import { request } from "./client";
import type { PageResult, Staff, StaffPayload, StaffQuery } from "./types";

export function getStaffListApi(params: StaffQuery) {
  return request.get<PageResult<Staff>>("/staff", params);
}

export function getStaffApi(id: string) {
  return request.get<Staff>(`/staff/${id}`);
}

export function createStaffApi(payload: StaffPayload) {
  return request.post<Staff, StaffPayload>("/staff", payload);
}

export function updateStaffApi(id: string, payload: StaffPayload) {
  return request.put<Staff, StaffPayload>(`/staff/${id}`, payload);
}

export function deleteStaffApi(id: string) {
  return request.delete<boolean>(`/staff/${id}`);
}
