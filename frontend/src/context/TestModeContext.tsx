import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PaymentSimulation = "success" | "fail" | "random";

interface TestModeContextValue {
  isTestMode: boolean;
  setTestMode: (value: boolean) => void;
  paymentSimulation: PaymentSimulation;
  setPaymentSimulation: (value: PaymentSimulation) => void;
  shouldSimulateFailure: () => boolean;
}

const TestModeContext = createContext<TestModeContextValue | undefined>(undefined);

const STORAGE_KEY_ENABLED = "test_mode_enabled";
const STORAGE_KEY_PAYMENT = "test_mode_payment_simulation";

export function TestModeProvider({ children }: { children: ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(() => localStorage.getItem(STORAGE_KEY_ENABLED) === "true");
  const [paymentSimulation, setPaymentSimulationState] = useState<PaymentSimulation>(
    () => (localStorage.getItem(STORAGE_KEY_PAYMENT) as PaymentSimulation) || "success"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ENABLED, String(isTestMode));
  }, [isTestMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYMENT, paymentSimulation);
  }, [paymentSimulation]);

  function shouldSimulateFailure(): boolean {
    if (!isTestMode) return false;
    if (paymentSimulation === "fail") return true;
    if (paymentSimulation === "random") return Math.random() < 0.5;
    return false;
  }

  return (
    <TestModeContext.Provider
      value={{
        isTestMode,
        setTestMode: setIsTestMode,
        paymentSimulation,
        setPaymentSimulation: setPaymentSimulationState,
        shouldSimulateFailure,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestMode(): TestModeContextValue {
  const ctx = useContext(TestModeContext);
  if (!ctx) throw new Error("useTestMode must be used within TestModeProvider");
  return ctx;
}
