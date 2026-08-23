import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzB from "./healthz-smoke-450228657-b";

describe("GET /api/healthz-smoke-450228657-b", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-450228657-b"));

    const result = await healthzB(event);

    expect(result).toEqual({ ok: true, variant: "450228657" });
  });
});
