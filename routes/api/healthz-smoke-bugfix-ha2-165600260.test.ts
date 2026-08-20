import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfixHa2 from "./healthz-smoke-bugfix-ha2-165600260";

describe("GET /api/healthz-smoke-bugfix-ha2-165600260", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-bugfix-ha2-165600260"),
    );

    const result = await healthzBugfixHa2(event);

    expect(result).toEqual({ ok: true, variant: "165600260" });
  });
});
