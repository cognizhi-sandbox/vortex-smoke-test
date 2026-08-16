import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzBugfix from "./healthz-smoke-bugfix-27681476";

describe("GET /api/healthz-smoke-bugfix-27681476", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-27681476"));

    const result = await healthzBugfix(event);

    expect(result).toEqual({ ok: true, variant: "27681476" });
  });
});
