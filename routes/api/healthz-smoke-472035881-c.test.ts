import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzC from "./healthz-smoke-472035881-c";

describe("GET /api/healthz-smoke-472035881-c", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-472035881-c"));

    const result = await healthzC(event);

    expect(result).toEqual({ ok: true, variant: "472035881" });
  });
});
