export type ScooterStatus = "available" | "in_use" | "maintenance" | "offline";

export interface Scooter {
  id: string;
  number: string;
  model: string;
  status: ScooterStatus;
  battery_level: number;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export type ScooterInput = Omit<Scooter, "id" | "updated_at">;

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  balance: string;
  created_at: string;
}

export type RentalStatus = "active" | "completed";

export interface Rental {
  id: string;
  scooter_id: string;
  customer_id: string;
  status: RentalStatus;
  start_time: string;
  end_time: string | null;
  cost: string | null;
  scooter: Scooter;
  customer: Customer;
}

export interface RentalInput {
  scooter_id: string;
  customer_name: string;
  customer_phone: string;
}

export interface AppSettingsData {
  price_per_minute: string;
}

export interface AnalyticsSummary {
  scooters_by_status: Record<ScooterStatus, number>;
  total_scooters: number;
  active_rentals: number;
  average_battery_level: number;
}

export interface CurrentUser {
  email: string;
  full_name: string;
}
