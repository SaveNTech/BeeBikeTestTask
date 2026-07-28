import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { extractErrorMessage } from "./client";

function axiosErrorWithDetail(detail: unknown): AxiosError {
  const error = new AxiosError("Request failed");
  // @ts-expect-error -- minimal shape is enough for extractErrorMessage
  error.response = { data: { detail } };
  return error;
}

describe("extractErrorMessage", () => {
  it("extracts a plain string detail from the API response", () => {
    expect(extractErrorMessage(axiosErrorWithDetail("Самокат не найден"))).toBe("Самокат не найден");
  });

  it("joins FastAPI validation error arrays into one message", () => {
    const detail = [{ msg: "Обязательное поле" }, { msg: "Неверный формат" }];
    expect(extractErrorMessage(axiosErrorWithDetail(detail))).toBe("Обязательное поле, Неверный формат");
  });

  it("falls back to the axios error message when there is no detail", () => {
    const error = new AxiosError("Network Error");
    expect(extractErrorMessage(error)).toBe("Network Error");
  });

  it("falls back to a generic message for non-axios errors", () => {
    expect(extractErrorMessage(new Error("boom"))).toBe("Произошла непредвиденная ошибка");
  });
});
