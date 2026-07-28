import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "../api/analytics";
import { Sparkline } from "../components/Sparkline";
import { StatusBadge } from "../components/StatusBadge";
import { StatValue } from "../components/StatValue";
import type { ScooterStatus } from "../types";

const POLL_INTERVAL_MS = 5000;
const HISTORY_LENGTH = 20;

const STATUS_ORDER: ScooterStatus[] = ["available", "in_use", "maintenance", "offline"];

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchAnalyticsSummary,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const [batteryHistory, setBatteryHistory] = useState<number[]>([]);

  useEffect(() => {
    if (data === undefined) return;
    setBatteryHistory((prev) => [...prev, data.average_battery_level].slice(-HISTORY_LENGTH));
  }, [data?.average_battery_level]);

  if (isLoading) return <div className="page-loading">Загрузка аналитики...</div>;
  if (isError || !data) return <div className="form-error">Не удалось загрузить аналитику</div>;

  return (
    <div>
      <h1 className="page-title">Аналитика</h1>
      <p className="page-subtitle">Обновляется автоматически каждые 5 секунд</p>

      <div className="stat-grid">
        <div className="stat-card stat-card-highlight">
          <div className="stat-value">
            <StatValue value={data.total_scooters} />
          </div>
          <div className="stat-label">Всего самокатов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <StatValue value={data.active_rentals} />
          </div>
          <div className="stat-label">Активных аренд</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <StatValue value={data.average_battery_level} decimals={1} suffix="%" />
          </div>
          <div className="stat-label">Средний заряд</div>
          <Sparkline data={batteryHistory} />
        </div>
      </div>

      <h2 className="section-title">Самокаты по статусам</h2>
      <div className="stat-grid">
        {STATUS_ORDER.map((status) => (
          <div className="stat-card" key={status}>
            <div className="stat-value">
              <StatValue value={data.scooters_by_status[status] ?? 0} />
            </div>
            <div className="stat-label">
              <StatusBadge status={status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
