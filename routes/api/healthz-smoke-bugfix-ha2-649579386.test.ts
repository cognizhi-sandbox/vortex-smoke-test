import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfixHa2 from "./healthz-smoke-bugfix-ha2-649579386";

describe("GET /api/healthz-smoke-bugfix-ha2-649579386", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-bugfix-ha2-649579386"),
    );

    const result = await healthzBugfixHa2(event);

    expect(result).toEqual({ ok: true, variant: "649579386" });
  });
});
