import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzB from "./healthz-smoke-126862920-b";

describe("GET /api/healthz-smoke-126862920-b", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-126862920-b"));

    const result = await healthzB(event);

    expect(result).toEqual({ ok: true, variant: "126862920" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-126862920-b"));

    const start = Date.now();
    await healthzB(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
