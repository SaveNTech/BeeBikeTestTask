import { apiClient } from "./client";
import type { CurrentUser } from "../types";

export async function login(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<{ access_token: string }>("/auth/login", {
    email,
    password,
  });
  return data.access_token;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/auth/me");
  return data;
}
