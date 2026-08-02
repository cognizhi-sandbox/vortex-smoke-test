import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzC from "./healthz-smoke-680958919-c";

describe("GET /api/healthz-smoke-680958919-c", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-c"));

    const result = await healthzC(event);

    expect(result).toEqual({ ok: true, variant: "680958919" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-c"));

    const start = Date.now();
    await healthzC(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
