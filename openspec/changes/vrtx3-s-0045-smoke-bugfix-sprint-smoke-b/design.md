# Design — vrtx3-s-0045-smoke-bugfix-sprint-smoke-b

Read this before implementing. The tickets' `PLAN.md` files cite these sections rather than
repeating them.

## Measured context

Taken on `vortex/sprint/vrtx3-s-0045-4cae88d7` during planning, against a live `bun run dev`.

- **Dev server bound `:5005`.** `:5000`–`:5004` were all in use; the Vite banner named the port it
  took. Read your own banner — the port is per container, not per sprint, and a sibling's number is
  not yours to reuse.
- **The three defect paths and a control:**

  | Path                                       | Status | Content-Type       | Body                                |
  | ------------------------------------------ | ------ | ------------------ | ----------------------------------- |
  | `/api/healthz-smoke-bugfix-1022589408`     | 200    | `text/html`        | SPA shell                           |
  | `/api/healthz-smoke-bugfix2-448657707`     | 200    | `text/html`        | SPA shell                           |
  | `/api/healthz-smoke-bugfix3-583276571`     | 200    | `text/html`        | SPA shell                           |
  | `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json` | `{"ok":true,"variant":"528856326"}` |

- **No file matches any of the three variants.** `ls routes/api/ | grep -E '1022589408\|448657707\|583276571'` returns nothing.
- **Family size:** 139 handlers and 139 colocated tests under `routes/api/` (280 `.ts` files
  total). 47 of the tests carry `expect(elapsed).toBeLessThan(100)`; that numerator is fixed
  because the legacy tests are never rewritten, and only the denominator grows.

## D1 — The reported `404` is a mis-transcription; verify on body, never on status

An unmatched `/api/*` path falls through to the SPA `index.html` shell and answers `200 text/html`
in dev and in the production build alike. A status-code check therefore cannot tell a wired probe
from a missing one, and a `404 → 200` assertion proves nothing.

Every verification in this change asserts the **response body and `Content-Type`**:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:<banner-port>/api/<route>
# missing → 200 text/html; charset=utf-8
# wired   → 200 application/json;charset=UTF-8
```

The same applies in reverse to the unit test: a route's unit test imports the handler module
directly, so it passes even when Nitro never registered the path. Only a live request proves the
route is wired. Both checks are required; neither substitutes for the other.

## D2 — Copy the pinned `healthz-smoke-528856326-a` pair, not the sibling the canvas names

The canvas behind VRTX3-T-0303 names `routes/api/healthz-smoke-bugfix3-1056287485.{ts,test.ts}` as
its template. That pair was diffed during planning and is clean — it postdates VRTX3-S-0011 and
carries no wall-clock timing case — so the substitution costs nothing here. It is made anyway,
because 47 of the 139 probe tests do carry `expect(elapsed).toBeLessThan(100)`, the safe/unsafe
split is not visible from a filename, and the pinned pair is the one file whose shape is guaranteed.

Handler, verbatim except the variant string:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "<variant>",
  };
});
```

Test, following the pinned pair's single body assertion, with the bugfix-subfamily regression header
the sibling bugfix probes carry:

```ts
/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/<route> was returning the SPA shell (reported as 404)
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./<route>";

describe("GET /api/<route>", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/<route>"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "<variant>" });
  });
});
```

**No timing assertion.** A wall-clock bound on a constant-returning handler measures the runner, not
the code. The property the reports are reaching for — the probe performs no I/O — is guaranteed
structurally instead, by the interface contract in D3: the only import is `defineHandler`, so there
is nothing for the handler to wait on.

## D3 — Fixed interface contract (all three probes)

Binding on every ticket in this change. An implementation agent must not vary any of it.

- Default export is `defineHandler(() => ({ ok: true, variant: "<variant>" }))`.
- `variant` is a **string**, and is the numeric segment of the route with no prefix.
- The response object has exactly two keys — no `status`, no `timestamp`, no renamed field.
- The only import in the handler is `defineHandler` from `nitro/h3`. No `db/`, no
  `middleware/auth.ts`, no read of `event.context`, no import of any sibling probe.
- The handler declares **no method guard**. Every probe in the family is method-agnostic; adding a
  `405` to one route in isolation would make it inconsistent with 138 others.
- The test file is named exactly `<route>.test.ts`. `routes/**` sits inside the scanned `serverDir`,
  and only `ignore: ["**/*.test.ts"]` in `vite.config.ts` keeps it out of the server bundle — any
  other suffix ships a test as a live route. It is also what puts the test in the node-environment
  `server` vitest project; the `client` project excludes `routes/**`, and a misplaced test would run
  under jsdom and fail on server imports.

## D4 — No shared code, and therefore no ticket ordering

Each probe owns two new files and modifies none. The ownership maps are disjoint, so the three
tickets carry no `depends_on` and merge into the sprint branch in any order.

Do not factor the three handlers into a shared helper, factory, constants file or barrel export.
The duplication is deliberate and is the standing decision recorded in `ARCHITECTURE.md`
§ Key Decisions: independence is what lets each probe be built and merged without touching a file
another probe owns. This change adds nothing to that decision and does not amend it.
