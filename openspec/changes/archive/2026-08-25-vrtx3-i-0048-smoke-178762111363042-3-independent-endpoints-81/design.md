# Design — three independent health probes (812788042)

## Context

`routes/api/` holds 245 entries at the time of writing: 121 probe handlers, their 121 colocated
tests, `hello.ts`, `hello.test.ts` and the `users/` directory. Counted recursively that is 248
`.ts` files, because `users/` is one entry and four files. A repo-wide grep for `812788042`
returns zero matches, so all three target paths are unwritten.

Measured live on a dev server during planning (Vite reported `Port 5000 is in use` and bound
`:5001`; read your own banner, the port is per-container):

```
/api/healthz-smoke-812788042-a   →  200 text/html; charset=utf-8        949 B  (SPA shell)
/api/healthz-smoke-812788042-b   →  200 text/html; charset=utf-8        949 B  (SPA shell)
/api/healthz-smoke-812788042-c   →  200 text/html; charset=utf-8        949 B  (SPA shell)
/api/healthz-smoke-528856326-a   →  200 application/json;charset=UTF-8   33 B  {"ok":true,"variant":"528856326"}
```

The `health-probes` capability already exists in `openspec/specs/health-probes/spec.md`, written
at VRTX3-S-0038's close. This change adds three requirements to it and restates none.

## Decisions

### D1 — Three tickets, one file pair each, no dependency edge

Each probe is implemented by its own ticket owning exactly two new files. The ownership maps are
disjoint, so no `depends_on` edge is set and the three can land in any order.

This is the point of the change rather than a convenience. Nitro resolves `/api/<name>` purely
from the presence of `routes/api/<name>.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`
in `vite.config.ts` — so there is no route table, registry or index to edit. Without a shared
registration point, three additive tickets have nothing to serialise on.

**Rejected:** one ticket adding all three files. It would deliver the same six files while
destroying the property the change exists to demonstrate.

### D2 — Duplicate the handler; introduce no shared helper

Each handler repeats the same seven lines rather than calling a shared factory. A shared module
would convert every future probe into a shared-file edit — precisely the coupling D1 removes —
and would turn this change from six new files into a refactor of 121 existing routes.

The cost is bounded: a probe file never changes after it lands. The benefit recurs every sprint
as a zero-overlap ownership map.

**Rejected:** a parameterised route (`routes/api/healthz-smoke-[variant].ts`) covering the family.
It would couple the three units of work and silently change the behaviour of paths that do not
exist yet.

### D3 — Verify on response body and `Content-Type`, never on status code

An unmatched `/api/*` path is handed to the SPA and answered `200 text/html`, as the measurement
above shows. A route that does not exist and a route that does are therefore indistinguishable by
status code, and a `404 → 200` check passes either way.

Every scenario in the delta spec is written against the body plus the content type for this
reason. Whether a route compiled into the production server is confirmed separately, by the
presence of its module under `.output/server/_routes/api/` (dashes converted to underscores:
`/api/healthz-smoke-812788042-a` → `healthz_smoke_812788042_a.mjs`).

### D4 — Copy `healthz-smoke-528856326-a.{ts,test.ts}`, not the files the idea names

47 of the 121 existing probe tests, all written before VRTX3-S-0011, carry a second
`responds in under 100ms` case. A wall-clock assertion on a shared CI runner is flaky and proves
nothing about the contract, so the current pattern is a single body assertion.

VRTX3-I-0048 names `healthz-smoke-1065915107-a.ts` as its handler reference and
`healthz-smoke-1065915107-c.test.ts` as its test reference. Both were diffed during planning and
carry no timing case, so the substitution costs nothing on this change — but it is applied
regardless, because the directory offers no in-band way to tell a safe neighbour from a legacy
one, and three prior changes in this family have propagated the timing case by sampling.

Note which halves were cited. Only tests carry the timing case; a canvas that quotes a handler has
said nothing about the risky half of the pair. Here both halves were named and both were checked.

### D5 — No structural guard against non-`GET` verbs

None of the 121 existing handlers declares a method guard, so every verb receives the same body.
Adding a `405` to three routes in isolation would make them inconsistent with the rest of the
family. The idea puts method handling out of scope; the delta spec follows it and states the
contract for `GET`.

### D6 — No latency requirement

The idea asks that each probe respond without auth and without a database available. That is
stated structurally — the handler's only import is `nitro/h3`, it reads no event property and
touches no module under `db/` — rather than as a wall-clock threshold. A probe that performs no
I/O has its latency guaranteed by its dependency graph; a timing assertion would measure the CI
runner instead.

## Implementation shape

Per probe, copied from the pinned pair with only the variant string and the path changed:

```ts
// routes/api/healthz-smoke-812788042-a.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "812788042",
  };
});
```

```ts
// routes/api/healthz-smoke-812788042-a.test.ts
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-812788042-a";

describe("GET /api/healthz-smoke-812788042-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-812788042-a"));

    const result = await healthzA(event);

    expect(result).toEqual({ ok: true, variant: "812788042" });
  });
});
```

A route's unit test imports the handler module directly, so it passes even if Nitro never
registered the path. The test proves the handler's return value; only a live request or the
build output proves the route is wired. Both are covered by the spec's scenarios.

## Open questions

None. Paths, body and per-probe independence are fully specified upstream, and the `variant`
value is the literal string `"812788042"` on all three probes rather than a per-probe value.
