import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfix147016547 from "./healthz-smoke-bugfix-147016547";

describe("GET /api/healthz-smoke-bugfix-147016547", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-147016547"));

    const result = await healthzBugfix147016547(event);

    expect(result).toEqual({ ok: true, variant: "147016547" });
  });
});
