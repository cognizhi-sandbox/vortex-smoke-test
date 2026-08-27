import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-436511294-a";

describe("GET /api/healthz-smoke-436511294-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-436511294-a"));

    const result = await healthzA(event);

    expect(result).toEqual({ ok: true, variant: "436511294" });
  });
});
