import { apiClient } from "./client";
import type { AnalyticsSummary } from "../types";

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
}
