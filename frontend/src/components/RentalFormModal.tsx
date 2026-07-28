import { useState, type FormEvent } from "react";
import { extractErrorMessage } from "../api/client";
import type { RentalInput, Scooter } from "../types";
import { Modal } from "./Modal";

interface Props {
  availableScooters: Scooter[];
  onClose: () => void;
  onSubmit: (payload: RentalInput) => Promise<void>;
}

export function RentalFormModal({ availableScooters, onClose, onSubmit }: Props) {
  const [scooterId, setScooterId] = useState(availableScooters[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!scooterId) {
      setError("Нет доступных самокатов для аренды");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ scooter_id: scooterId, customer_name: customerName, customer_phone: customerPhone });
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Новая аренда" onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span>Самокат</span>
          <select value={scooterId} onChange={(e) => setScooterId(e.target.value)} required>
            {availableScooters.length === 0 && <option value="">Нет доступных самокатов</option>}
            {availableScooters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number} — {s.model} ({s.battery_level}%)
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Имя клиента</span>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required maxLength={255} />
        </label>

        <label className="field">
          <span>Телефон</span>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            maxLength={50}
            placeholder="+7 900 000-00-00"
          />
          <span className="field-hint">
            Если клиент с таким телефоном уже есть — аренда привяжется к его балансу.
          </span>
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !scooterId}>
            {isSubmitting ? "Создание..." : "Начать аренду"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
