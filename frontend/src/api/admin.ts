import { apiClient } from "./client";

export async function reseedDemoData(): Promise<void> {
  await apiClient.post("/admin/reseed");
}

export async function simulateActivity(): Promise<void> {
  await apiClient.post("/admin/simulate");
}
