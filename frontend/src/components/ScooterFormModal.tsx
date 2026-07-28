import { useState, type FormEvent } from "react";
import { extractErrorMessage } from "../api/client";
import type { Scooter, ScooterInput, ScooterStatus } from "../types";
import { Modal } from "./Modal";

const STATUS_OPTIONS: { value: ScooterStatus; label: string }[] = [
  { value: "available", label: "Доступен" },
  { value: "in_use", label: "В аренде" },
  { value: "maintenance", label: "На обслуживании" },
  { value: "offline", label: "Офлайн" },
];

interface Props {
  scooter?: Scooter;
  onClose: () => void;
  onSubmit: (payload: ScooterInput) => Promise<void>;
}

export function ScooterFormModal({ scooter, onClose, onSubmit }: Props) {
  const [number, setNumber] = useState(scooter?.number ?? "");
  const [model, setModel] = useState(scooter?.model ?? "");
  const [status, setStatus] = useState<ScooterStatus>(scooter?.status ?? "available");
  const [batteryLevel, setBatteryLevel] = useState(scooter?.battery_level ?? 100);
  const [latitude, setLatitude] = useState(scooter?.latitude ?? 55.7558);
  const [longitude, setLongitude] = useState(scooter?.longitude ?? 37.6173);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        number,
        model,
        status,
        battery_level: batteryLevel,
        latitude,
        longitude,
      });
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={scooter ? "Редактировать самокат" : "Новый самокат"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span>Номер</span>
          <input value={number} onChange={(e) => setNumber(e.target.value)} required maxLength={50} />
        </label>

        <label className="field">
          <span>Модель</span>
          <input value={model} onChange={(e) => setModel(e.target.value)} required maxLength={100} />
        </label>

        <label className="field">
          <span>Статус</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as ScooterStatus)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Заряд (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={batteryLevel}
            onChange={(e) => setBatteryLevel(Number(e.target.value))}
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Широта</span>
            <input
              type="number"
              step="any"
              min={-90}
              max={90}
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              required
            />
          </label>
          <label className="field">
            <span>Долгота</span>
            <input
              type="number"
              step="any"
              min={-180}
              max={180}
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              required
            />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
