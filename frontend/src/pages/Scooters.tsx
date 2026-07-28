import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createScooter, deleteScooter, fetchScooters, updateScooter } from "../api/scooters";
import { extractErrorMessage } from "../api/client";
import { ScooterFormModal } from "../components/ScooterFormModal";
import { ScooterMap } from "../components/ScooterMap";
import { StatusBadge } from "../components/StatusBadge";
import type { Scooter, ScooterInput, ScooterStatus } from "../types";

const POLL_INTERVAL_MS = 5000;

const STATUS_OPTIONS: { value: ScooterStatus | ""; label: string }[] = [
  { value: "", label: "Все статусы" },
  { value: "available", label: "Доступен" },
  { value: "in_use", label: "В аренде" },
  { value: "maintenance", label: "На обслуживании" },
  { value: "offline", label: "Офлайн" },
];

export function Scooters() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"table" | "map">("table");
  const [statusFilter, setStatusFilter] = useState<ScooterStatus | "">("");
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<{ mode: "create" } | { mode: "edit"; scooter: Scooter } | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scooters", statusFilter, search],
    queryFn: () => fetchScooters({ status: statusFilter, search }),
    refetchInterval: POLL_INTERVAL_MS,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["scooters"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
  }

  async function handleCreate(payload: ScooterInput) {
    await createScooter(payload);
    invalidate();
  }

  async function handleUpdate(id: string, payload: ScooterInput) {
    await updateScooter(id, payload);
    invalidate();
  }

  async function handleDelete(scooter: Scooter) {
    if (!confirm(`Удалить самокат ${scooter.number}?`)) return;
    setActionError(null);
    try {
      await deleteScooter(scooter.id);
      invalidate();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  const scooters = data ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Самокаты</h1>
          <p className="page-subtitle">Всего: {scooters.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalState({ mode: "create" })}>
          + Добавить самокат
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по номеру или модели..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ScooterStatus | "")}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="view-toggle">
          <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>
            Таблица
          </button>
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
            Карта
          </button>
        </div>
      </div>

      {actionError && <div className="form-error">{actionError}</div>}

      {isLoading && <div className="page-loading">Загрузка...</div>}
      {isError && <div className="form-error">Не удалось загрузить список самокатов</div>}

      {!isLoading && !isError && view === "table" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Модель</th>
                <th>Статус</th>
                <th>Заряд</th>
                <th>Координаты</th>
                <th>Обновлено</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scooters.map((scooter) => (
                <tr key={scooter.id}>
                  <td className="mono">{scooter.number}</td>
                  <td>{scooter.model}</td>
                  <td>
                    <StatusBadge status={scooter.status} />
                  </td>
                  <td>
                    <div className="battery-bar">
                      <div
                        className="battery-bar-fill"
                        style={{
                          width: `${scooter.battery_level}%`,
                          background: scooter.battery_level < 20 ? "#ef4444" : "#22c55e",
                        }}
                      />
                      <span>{scooter.battery_level}%</span>
                    </div>
                  </td>
                  <td className="mono">
                    {scooter.latitude.toFixed(4)}, {scooter.longitude.toFixed(4)}
                  </td>
                  <td>{new Date(scooter.updated_at).toLocaleString("ru-RU")}</td>
                  <td className="actions-cell">
                    <button className="btn btn-ghost" onClick={() => setModalState({ mode: "edit", scooter })}>
                      Изменить
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(scooter)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {scooters.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Самокаты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && view === "map" && <ScooterMap scooters={scooters} />}

      {modalState?.mode === "create" && (
        <ScooterFormModal onClose={() => setModalState(null)} onSubmit={handleCreate} />
      )}
      {modalState?.mode === "edit" && (
        <ScooterFormModal
          scooter={modalState.scooter}
          onClose={() => setModalState(null)}
          onSubmit={(payload) => handleUpdate(modalState.scooter.id, payload)}
        />
      )}
    </div>
  );
}
