import { useState, type FormEvent } from "react";
import { extractErrorMessage } from "../api/client";
import { useTestMode } from "../context/TestModeContext";
import type { Customer } from "../types";
import { Modal } from "./Modal";

interface Props {
  customer: Customer;
  onClose: () => void;
  onSubmit: (amount: number, simulateFailure: boolean) => Promise<void>;
}

const QUICK_AMOUNTS = [100, 300, 500, 1000];

export function TopUpModal({ customer, onClose, onSubmit }: Props) {
  const { isTestMode, shouldSimulateFailure } = useTestMode();
  const [amount, setAmount] = useState(300);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(amount, shouldSimulateFailure());
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={`Пополнить баланс — ${customer.full_name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-grid">
        <p className="field-hint">
          Это демо-пополнение: реальный платёжный шлюз не подключён, операция происходит мгновенно.
          {isTestMode && " Тестовый режим определяет успех/отказ по настройке в разделе «Настройки»."}
        </p>

        <label className="field">
          <span>Сумма, ₽</span>
          <input
            type="number"
            min={1}
            max={100000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </label>

        <div className="toolbar">
          {QUICK_AMOUNTS.map((value) => (
            <button type="button" key={value} className="btn btn-ghost" onClick={() => setAmount(value)}>
              +{value} ₽
            </button>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">Баланс пополнен ✓</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || success}>
            {isSubmitting ? "Обработка..." : "Пополнить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
