import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfix3 from "./healthz-smoke-bugfix3-428029175";

describe("GET /api/healthz-smoke-bugfix3-428029175", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-428029175"));

    const result = await healthzBugfix3(event);

    expect(result).toEqual({ ok: true, variant: "428029175" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-428029175"));

    const start = Date.now();
    await healthzBugfix3(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
