import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfix3 from "./healthz-smoke-bugfix3-287868165";

describe("GET /api/healthz-smoke-bugfix3-287868165", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-287868165"));

    const result = await healthzBugfix3(event);

    expect(result).toEqual({ ok: true, variant: "287868165" });
  });
});
