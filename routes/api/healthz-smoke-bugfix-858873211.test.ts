import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix-858873211";

describe("GET /api/healthz-smoke-bugfix-858873211", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-858873211"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "858873211" });
  });
});
