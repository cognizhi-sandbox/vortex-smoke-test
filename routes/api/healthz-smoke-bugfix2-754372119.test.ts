import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-bugfix2-754372119";

describe("GET /api/healthz-smoke-bugfix2-754372119", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-754372119"));

    const result = await healthzA(event);

    expect(result).toEqual({ ok: true, variant: "754372119" });
  });
});
