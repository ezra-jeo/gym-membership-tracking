import { beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserClientMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: unknown[]) => createBrowserClientMock(...args),
}));

describe("createClient singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    createBrowserClientMock.mockReset();
    createBrowserClientMock.mockReturnValue({ client: "mock" });
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "example-anon-key";
  });

  it("returns the same instance across multiple calls", async () => {
    const { createClient } = await import("@/lib/supabase");

    const first = createClient();
    const second = createClient();

    expect(first).toBe(second);
    expect(createBrowserClientMock).toHaveBeenCalledTimes(1);
  });

  it("passes env values to browser client factory", async () => {
    const { createClient } = await import("@/lib/supabase");

    createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "example-anon-key",
    );
  });
});
