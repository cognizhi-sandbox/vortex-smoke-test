import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzC from "./healthz-smoke-888240601-c";

describe("GET /api/healthz-smoke-888240601-c", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-888240601-c"));

    const result = await healthzC(event);

    expect(result).toEqual({ ok: true, variant: "888240601" });
  });
});
