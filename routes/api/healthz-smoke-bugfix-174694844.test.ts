import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfix174694844 from "./healthz-smoke-bugfix-174694844";

describe("GET /api/healthz-smoke-bugfix-174694844", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-174694844"));

    const result = await healthzBugfix174694844(event);

    expect(result).toEqual({ ok: true, variant: "174694844" });
  });
});
