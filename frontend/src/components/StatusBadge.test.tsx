import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["available", "Доступен"],
    ["in_use", "В аренде"],
    ["maintenance", "На обслуживании"],
    ["offline", "Офлайн"],
  ] as const)("renders the Russian label for status=%s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("applies a status-specific class for styling", () => {
    render(<StatusBadge status="maintenance" />);
    expect(screen.getByText("На обслуживании")).toHaveClass("status-maintenance");
  });
});
