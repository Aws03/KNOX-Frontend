import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ session: null as null | Record<string, unknown> }));
const post = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authStorage", () => ({
  readSession: () => storage.session,
  persistSession: (session: Record<string, unknown>) => {
    storage.session = session;
  },
  getStoredToken: () => storage.session?.token ?? null,
  clearSession: () => {
    storage.session = null;
  },
}));

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return { default: { ...actual.default, post } };
});

import { refreshSession } from "./apiClient";

// A JWT whose payload is {"exp": <expSeconds>} (signature irrelevant: the client only decodes it).
const jwt = (expSeconds: number) =>
  `h.${btoa(JSON.stringify({ exp: expSeconds })).replace(/=+$/, "")}.s`;
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

describe("refreshSession", () => {
  beforeEach(() => {
    post.mockReset();
    storage.session = { token: "old-access", refreshToken: "old-refresh", user: {}, expiresAt: Date.now() - 1 };
  });

  it("refreshes once for concurrent callers and stores the new pair", async () => {
    const newAccess = jwt(inOneHour());
    post.mockResolvedValue({ data: { accessToken: newAccess, refreshToken: "new-refresh" } });

    const results = await Promise.all([refreshSession("old-access"), refreshSession("old-access")]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][1]).toEqual({ refreshToken: "old-refresh" });
    expect(results.map((r) => r.accessToken)).toEqual([newAccess, newAccess]);
    expect(storage.session).toMatchObject({ token: newAccess, refreshToken: "new-refresh" });
  });

  it("adopts a session another tab already refreshed instead of re-sending a spent refresh token", async () => {
    storage.session = { token: "fresh-from-other-tab", refreshToken: "rotated", user: {}, expiresAt: Date.now() + 600_000 };

    const tokens = await refreshSession("old-access");

    expect(post).not.toHaveBeenCalled();
    expect(tokens).toEqual({ accessToken: "fresh-from-other-tab", refreshToken: "rotated" });
  });

  it("fails when there is no session to refresh", async () => {
    storage.session = null;

    await expect(refreshSession(null)).rejects.toThrow("No session");
  });
});
