import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { reseedDemoData, simulateActivity } from "../api/admin";
import { extractErrorMessage } from "../api/client";
import { fetchSettings, updateSettings } from "../api/settings";
import { useTestMode, type PaymentSimulation } from "../context/TestModeContext";

type Tab = "tariff" | "test-mode";

export function Settings() {
  const [tab, setTab] = useState<Tab>("tariff");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Настройки</h1>
          <p className="page-subtitle">Тариф и инструменты для проверки функций CRM</p>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === "tariff" ? "active" : ""} onClick={() => setTab("tariff")}>
          Тариф
        </button>
        <button className={tab === "test-mode" ? "active" : ""} onClick={() => setTab("test-mode")}>
          Test mode
        </button>
      </div>

      {tab === "tariff" && <TariffSection />}
      {tab === "test-mode" && <TestModeSection />}
    </div>
  );
}

function TariffSection() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [price, setPrice] = useState("5.00");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) setPrice(data.price_per_minute);
  }, [data]);

  async function handleSave() {
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      await updateSettings(Number(price));
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="settings-section">
      <div className="field">
        <span>Стоимость аренды, ₽/мин</span>
        <input type="number" min={0.1} step={0.1} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <p className="field-hint" style={{ marginTop: 8 }}>
        Списывается с баланса клиента при завершении аренды (округление до полной минуты в большую сторону).
      </p>
      {error && (
        <div className="form-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="form-success" style={{ marginTop: 12 }}>
          Тариф обновлён ✓
        </div>
      )}
      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

function TestModeSection() {
  const { isTestMode, setTestMode, paymentSimulation, setPaymentSimulation } = useTestMode();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleReseed() {
    if (!confirm("Сбросить все данные и заново загрузить демо-фикстуры?")) return;
    setIsBusy(true);
    setError(null);
    setMessage(null);
    try {
      await reseedDemoData();
      queryClient.invalidateQueries();
      setMessage("Демо-данные пересозданы ✓");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSimulate() {
    setIsBusy(true);
    setError(null);
    setMessage(null);
    try {
      await simulateActivity();
      queryClient.invalidateQueries({ queryKey: ["scooters"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      setMessage("Статусы и заряд самокатов обновлены ✓");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Тестовый режим</div>
          <div className="field-hint">Показывает баннер в интерфейсе и включает мок-сценарии оплаты</div>
        </div>
        <div
          className={`toggle-switch ${isTestMode ? "on" : ""}`}
          onClick={() => setTestMode(!isTestMode)}
          role="switch"
          aria-checked={isTestMode}
        >
          <div className="toggle-switch-knob" />
        </div>
      </div>

      <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Сценарий мок-оплаты (пополнение баланса)</div>
        <select
          value={paymentSimulation}
          onChange={(e) => setPaymentSimulation(e.target.value as PaymentSimulation)}
          style={{ width: "100%" }}
        >
          <option value="success">Всегда успех</option>
          <option value="fail">Всегда отказ</option>
          <option value="random">Случайно</option>
        </select>
      </div>

      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="modal-actions" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={handleSimulate} disabled={isBusy}>
          Симулировать изменение статусов самокатов
        </button>
        <button className="btn btn-danger" onClick={handleReseed} disabled={isBusy}>
          Сбросить и пересоздать демо-данные
        </button>
      </div>
    </div>
  );
}
