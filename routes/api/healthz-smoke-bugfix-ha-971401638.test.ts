import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfixHa from "./healthz-smoke-bugfix-ha-971401638";

describe("GET /api/healthz-smoke-bugfix-ha-971401638", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-bugfix-ha-971401638"),
    );

    const result = await healthzBugfixHa(event);

    expect(result).toEqual({ ok: true, variant: "971401638" });
  });
});
