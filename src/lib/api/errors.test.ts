import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

import { getApiErrorMessage, getApiErrorStatus } from "./errors";

function apiError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
}

describe("getApiErrorMessage", () => {
  it("prefers the problem detail", () => {
    const error = apiError(401, { title: "Unauthorized", detail: "Invalid credentials" });

    expect(getApiErrorMessage(error, "fallback")).toBe("Invalid credentials");
  });

  it("uses the first validation message when there is no detail", () => {
    const error = apiError(400, { title: "Validation failed", errors: { Password: ["Too short"] } });

    expect(getApiErrorMessage(error, "fallback")).toBe("Too short");
  });

  it("falls back to the title", () => {
    expect(getApiErrorMessage(apiError(409, { title: "Conflict" }), "fallback")).toBe("Conflict");
  });

  it("never surfaces axios's generic message", () => {
    expect(getApiErrorMessage(apiError(502, "<html>Bad gateway</html>"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(new AxiosError("Network Error"), "fallback")).toBe("fallback");
  });

  it("keeps the message of non-HTTP errors", () => {
    expect(getApiErrorMessage(new Error("Pick a course first"), "fallback")).toBe("Pick a course first");
    expect(getApiErrorMessage("boom", "fallback")).toBe("fallback");
  });
});

describe("getApiErrorStatus", () => {
  it("returns the HTTP status only for answered requests", () => {
    expect(getApiErrorStatus(apiError(404, {}))).toBe(404);
    expect(getApiErrorStatus(new AxiosError("Network Error"))).toBeUndefined();
    expect(getApiErrorStatus(new Error("x"))).toBeUndefined();
  });
});
