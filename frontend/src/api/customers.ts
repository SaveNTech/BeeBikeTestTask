import { apiClient } from "./client";
import type { Customer } from "../types";

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  const { data } = await apiClient.get<Customer[]>("/customers", { params });
  return data;
}

export async function topUpCustomer(
  id: string,
  amount: number,
  simulateFailure: boolean
): Promise<Customer> {
  const { data } = await apiClient.post<Customer>(`/customers/${id}/topup`, {
    amount,
    simulate_failure: simulateFailure,
  });
  return data;
}
