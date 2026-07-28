import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { extractErrorMessage } from "../api/client";
import { completeRental, createRental, fetchRentals } from "../api/rentals";
import { fetchScooters } from "../api/scooters";
import { RentalFormModal } from "../components/RentalFormModal";
import type { RentalInput, RentalStatus } from "../types";

const POLL_INTERVAL_MS = 5000;

export function Rentals() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<RentalStatus>("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const rentalsQuery = useQuery({
    queryKey: ["rentals", tab],
    queryFn: () => fetchRentals(tab),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const availableScootersQuery = useQuery({
    queryKey: ["scooters", "available"],
    queryFn: () => fetchScooters({ status: "available" }),
    enabled: showCreateModal,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["rentals"] });
    queryClient.invalidateQueries({ queryKey: ["scooters"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
  }

  async function handleCreate(payload: RentalInput) {
    await createRental(payload);
    invalidate();
  }

  async function handleComplete(id: string) {
    setActionError(null);
    try {
      await completeRental(id);
      invalidate();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  const rentals = rentalsQuery.data ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Аренды</h1>
          <p className="page-subtitle">Всего в списке: {rentals.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Новая аренда
        </button>
      </div>

      <div className="tabs">
        <button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>
          Активные
        </button>
        <button className={tab === "completed" ? "active" : ""} onClick={() => setTab("completed")}>
          Завершённые
        </button>
      </div>

      {actionError && <div className="form-error">{actionError}</div>}

      {rentalsQuery.isLoading && <div className="page-loading">Загрузка...</div>}
      {rentalsQuery.isError && <div className="form-error">Не удалось загрузить список аренд</div>}

      {!rentalsQuery.isLoading && !rentalsQuery.isError && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Самокат</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Начало</th>
                <th>Окончание</th>
                {tab === "completed" && <th>Стоимость</th>}
                <th>Статус</th>
                {tab === "active" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td>
                    <div className="mono">{rental.scooter.number}</div>
                    <div className="muted">{rental.scooter.model}</div>
                  </td>
                  <td>{rental.customer.full_name}</td>
                  <td className="mono">{rental.customer.phone}</td>
                  <td>{new Date(rental.start_time).toLocaleString("ru-RU")}</td>
                  <td>{rental.end_time ? new Date(rental.end_time).toLocaleString("ru-RU") : "—"}</td>
                  {tab === "completed" && (
                    <td className="mono">{rental.cost ? `${Number(rental.cost).toFixed(2)} ₽` : "—"}</td>
                  )}
                  <td>
                    <span className={`status-badge rental-status-${rental.status}`}>
                      {rental.status === "active" ? "Активна" : "Завершена"}
                    </span>
                  </td>
                  {tab === "active" && (
                    <td className="actions-cell">
                      <button className="btn btn-ghost" onClick={() => handleComplete(rental.id)}>
                        Завершить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan={tab === "active" ? 7 : 6} className="empty-state">
                    {tab === "active" ? "Активных аренд нет" : "Завершённых аренд нет"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <RentalFormModal
          availableScooters={availableScootersQuery.data ?? []}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
