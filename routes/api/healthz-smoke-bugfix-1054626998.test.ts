import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-bugfix-1054626998";

/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-bugfix-1054626998 was returning 404
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
describe("GET /api/healthz-smoke-bugfix-1054626998", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-1054626998"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "1054626998" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-1054626998"));

    const startTime = performance.now();
    await handler(event);
    const endTime = performance.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
