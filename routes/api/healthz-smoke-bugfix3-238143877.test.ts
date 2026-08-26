/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-bugfix3-238143877 was returning the SPA shell (reported as 404)
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-bugfix3-238143877";

describe("GET /api/healthz-smoke-bugfix3-238143877", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-238143877"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "238143877" });
  });
});
