import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestModeProvider, useTestMode } from "./TestModeContext";

function Harness() {
  const { isTestMode, setTestMode, setPaymentSimulation, shouldSimulateFailure } = useTestMode();
  return (
    <div>
      <span data-testid="mode">{isTestMode ? "on" : "off"}</span>
      <span data-testid="result">{String(shouldSimulateFailure())}</span>
      <button onClick={() => setTestMode(true)}>enable</button>
      <button onClick={() => setPaymentSimulation("fail")}>set-fail</button>
      <button onClick={() => setPaymentSimulation("success")}>set-success</button>
    </div>
  );
}

describe("TestModeContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to disabled, never simulating a failed payment", () => {
    render(
      <TestModeProvider>
        <Harness />
      </TestModeProvider>
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("off");
    expect(screen.getByTestId("result")).toHaveTextContent("false");
  });

  it("only simulates a failed payment when test mode is on and set to fail", () => {
    render(
      <TestModeProvider>
        <Harness />
      </TestModeProvider>
    );

    fireEvent.click(screen.getByText("set-fail"));
    expect(screen.getByTestId("result")).toHaveTextContent("false"); // still off

    fireEvent.click(screen.getByText("enable"));
    expect(screen.getByTestId("result")).toHaveTextContent("true");

    fireEvent.click(screen.getByText("set-success"));
    expect(screen.getByTestId("result")).toHaveTextContent("false");
  });
});
