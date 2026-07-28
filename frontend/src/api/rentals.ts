import { apiClient } from "./client";
import type { Rental, RentalInput, RentalStatus } from "../types";

export async function fetchRentals(status?: RentalStatus): Promise<Rental[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await apiClient.get<Rental[]>("/rentals", { params });
  return data;
}

export async function createRental(payload: RentalInput): Promise<Rental> {
  const { data } = await apiClient.post<Rental>("/rentals", payload);
  return data;
}

export async function completeRental(id: string): Promise<Rental> {
  const { data } = await apiClient.post<Rental>(`/rentals/${id}/complete`);
  return data;
}
