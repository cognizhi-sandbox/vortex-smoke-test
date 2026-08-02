import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-bugfix2-473664326";

/**
 * REGRESSION TEST
 *
 * Verifies that GET /api/healthz-smoke-bugfix2-473664326 returns a 200 response
 * with the correct JSON body. This endpoint should always respond quickly and
 * without errors.
 */
describe("/api/healthz-smoke-bugfix2-473664326", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-473664326"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "473664326" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-473664326"));

    const startTime = Date.now();
    await handler(event);
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
  });
});
