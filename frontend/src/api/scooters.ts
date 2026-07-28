import { apiClient } from "./client";
import type { Scooter, ScooterInput, ScooterStatus } from "../types";

export interface ScooterFilters {
  status?: ScooterStatus | "";
  search?: string;
}

export async function fetchScooters(filters: ScooterFilters = {}): Promise<Scooter[]> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  const { data } = await apiClient.get<Scooter[]>("/scooters", { params });
  return data;
}

export async function createScooter(payload: ScooterInput): Promise<Scooter> {
  const { data } = await apiClient.post<Scooter>("/scooters", payload);
  return data;
}

export async function updateScooter(id: string, payload: Partial<ScooterInput>): Promise<Scooter> {
  const { data } = await apiClient.put<Scooter>(`/scooters/${id}`, payload);
  return data;
}

export async function deleteScooter(id: string): Promise<void> {
  await apiClient.delete(`/scooters/${id}`);
}
