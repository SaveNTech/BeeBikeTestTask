import { apiClient } from "./client";
import type { AppSettingsData } from "../types";

export async function fetchSettings(): Promise<AppSettingsData> {
  const { data } = await apiClient.get<AppSettingsData>("/settings");
  return data;
}

export async function updateSettings(pricePerMinute: number): Promise<AppSettingsData> {
  const { data } = await apiClient.put<AppSettingsData>("/settings", {
    price_per_minute: pricePerMinute,
  });
  return data;
}
