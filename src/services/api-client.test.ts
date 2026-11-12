import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiRequest,
  clearAccessToken,
  saveAccessToken,
} from "@/services/api-client";

const sessionStorage = new Map<string, string>();
const dispatchEvent = vi.fn();

describe("API client", () => {
  beforeEach(() => {
    sessionStorage.clear();
    dispatchEvent.mockReset();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => sessionStorage.get(key) ?? null,
        setItem: (key: string, value: string) =>
          sessionStorage.set(key, value),
        removeItem: (key: string) => sessionStorage.delete(key),
      },
      dispatchEvent,
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("adds the bearer token to authenticated requests", async () => {
    saveAccessToken("test-access-token");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiRequest<{ status: string }>("/dashboard")).resolves.toEqual(
      { status: "ok" },
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(options?.headers).get("Authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("uses the API error detail in the rejected request", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "Credit is exhausted." }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiRequest("/expenses")).rejects.toThrow(
      "Credit is exhausted.",
    );
  });

  it("clears an expired token and notifies the auth context", async () => {
    saveAccessToken("expired-token");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "Authentication is required." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiRequest("/dashboard")).rejects.toThrow(
      "Authentication is required.",
    );
    expect(sessionStorage.has("mealwise.access-token.v1")).toBe(false);
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });

  it("supports clearing the token on logout", () => {
    saveAccessToken("test-access-token");
    clearAccessToken();

    expect(sessionStorage.has("mealwise.access-token.v1")).toBe(false);
  });
});
