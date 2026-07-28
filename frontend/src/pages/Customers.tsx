import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCustomers, topUpCustomer } from "../api/customers";
import { TopUpModal } from "../components/TopUpModal";
import type { Customer } from "../types";

const POLL_INTERVAL_MS = 5000;

function formatBalance(balance: string): { text: string; className: string } {
  const value = Number(balance);
  return {
    text: `${value.toFixed(2)} ₽`,
    className: `balance-badge ${value < 0 ? "balance-negative" : "balance-positive"}`,
  };
}

export function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [topUpTarget, setTopUpTarget] = useState<Customer | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const customers = data ?? [];

  async function handleTopUp(amount: number, simulateFailure: boolean) {
    if (!topUpTarget) return;
    await topUpCustomer(topUpTarget.id, amount, simulateFailure);
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Клиенты</h1>
          <p className="page-subtitle">Всего: {customers.length}</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по имени или телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <div className="page-loading">Загрузка...</div>}
      {isError && <div className="form-error">Не удалось загрузить список клиентов</div>}

      {!isLoading && !isError && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Баланс</th>
                <th>Клиент с</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const balance = formatBalance(customer.balance);
                return (
                  <tr key={customer.id}>
                    <td>{customer.full_name}</td>
                    <td className="mono">{customer.phone}</td>
                    <td>
                      <span className={balance.className}>{balance.text}</span>
                    </td>
                    <td>{new Date(customer.created_at).toLocaleDateString("ru-RU")}</td>
                    <td className="actions-cell">
                      <button className="btn btn-ghost" onClick={() => setTopUpTarget(customer)}>
                        Пополнить
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Клиенты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {topUpTarget && (
        <TopUpModal customer={topUpTarget} onClose={() => setTopUpTarget(null)} onSubmit={handleTopUp} />
      )}
    </div>
  );
}
