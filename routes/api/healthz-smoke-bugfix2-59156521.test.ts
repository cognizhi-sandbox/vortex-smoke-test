import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix2-59156521";

describe("GET /api/healthz-smoke-bugfix2-59156521", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-59156521"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "59156521" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-59156521"));

    const start = performance.now();
    await healthz(event);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
