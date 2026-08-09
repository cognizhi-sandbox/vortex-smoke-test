import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-46132092-a";

describe("GET /api/healthz-smoke-46132092-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-46132092-a"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "46132092" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-46132092-a"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
