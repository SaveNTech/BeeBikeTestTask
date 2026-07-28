import type { ScooterStatus } from "../types";

const STATUS_LABELS: Record<ScooterStatus, string> = {
  available: "Доступен",
  in_use: "В аренде",
  maintenance: "На обслуживании",
  offline: "Офлайн",
};

export function StatusBadge({ status }: { status: ScooterStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}
