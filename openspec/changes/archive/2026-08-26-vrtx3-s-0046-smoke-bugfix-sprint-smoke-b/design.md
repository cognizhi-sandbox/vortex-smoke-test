# Design — vrtx3-s-0046-smoke-bugfix-sprint-smoke-b

Read this before implementing. The tickets' `PLAN.md` files cite these sections rather than
repeating them.

## Measured context

Taken on `vortex/sprint/vrtx3-s-0046-9f6553fc` at `2b8bb3e` during planning, against a live
`bun run dev`.

- **Dev server bound `:5006`.** `:5000`–`:5005` were all in use; the Vite banner named the port it
  took. Read your own banner — the port is per container, not per sprint, and a sibling's number is
  not yours to reuse.
- **The three defect paths and a control:**

  | Path                                       | Status | Content-Type       | Size | Body                                |
  | ------------------------------------------ | ------ | ------------------ | ---- | ----------------------------------- |
  | `/api/healthz-smoke-bugfix-769466328`      | 200    | `text/html`        | 949b | SPA shell                           |
  | `/api/healthz-smoke-bugfix2-101945976`     | 200    | `text/html`        | 949b | SPA shell                           |
  | `/api/healthz-smoke-bugfix3-238143877`     | 200    | `text/html`        | 949b | SPA shell                           |
  | `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json` | 33b  | `{"ok":true,"variant":"528856326"}` |

- **No file matches any of the three variants.** A repo-wide grep for `769466328`, `101945976` and
  `238143877` across `routes/`, `src/` and `openspec/` returns nothing. These are never-written
  files, not moved or renamed ones.
- **Family size:** 142 handlers and 142 colocated tests under `routes/api/` (287 entries, 290 `.ts`
  files). 47 of the tests carry `expect(elapsed).toBeLessThan(100)`; that numerator is fixed because
  the legacy tests are never rewritten, and only the denominator grows.

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

This sprint is the thirtieth consecutive one to re-measure it and the seventh to show the
**uneven-capture split**: VRTX3-T-0309 has a canvas (VRTX3-I-0055) that predicts the SPA-shell
fallback correctly and says in as many words that it measured nothing — nothing was listening on
`:5000`, `:5001`, `:5002` or `:3000` in its capture container — while VRTX3-T-0307 and VRTX3-T-0308
have no idea linked and assert `404` unchecked. The split's record is now seven for seven and its
shape has never varied. Neither half tells you what is on disk today; only the measurement does.

## D2 — Copy the pinned `healthz-smoke-528856326-a` pair

VRTX3-I-0055 names the pinned pair itself, correctly, and additionally warns against sampling a
neighbouring `bugfix3-*` file. It is the third canvas to get this right (after VRTX3-I-0040 and
VRTX3-I-0044). It also quotes `routes/api/healthz-smoke-bugfix3-583276571.ts` in full as a working
sibling — a **handler**, which carries no risk, since only tests carry the wall-clock case. Both
that file's test and the pinned pair were diffed during planning and both are clean. A correct
pointer is still verified: the check costs one diff, the same diff that catches a wrong one.

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

**No timing assertion**, and this binds over the canvas. A wall-clock bound on a constant-returning
handler measures the runner, not the code. The property such an assertion reaches for — the probe
performs no I/O — is guaranteed structurally instead, by the interface contract in D3: the only
import is `defineHandler`, so there is nothing for the handler to wait on.

## D3 — Fixed interface contract (all three probes)

Binding on every ticket in this change. An implementation agent must not vary any of it.

- Default export is `defineHandler(() => ({ ok: true, variant: "<variant>" }))`.
- `variant` is a **string**, and is the numeric segment of the route with no prefix — `"769466328"`,
  not `"bugfix-769466328"` and not a number.
- The response object has exactly two keys — no `status`, no `timestamp`, no renamed field.
- The only import in the handler is `defineHandler` from `nitro/h3`. No `db/`, no
  `middleware/auth.ts`, no read of `event.context`, no import of any sibling probe.
- The handler declares **no method guard**. Every probe in the family is method-agnostic; adding a
  `405` to one route in isolation would make it inconsistent with 142 others.
- The test file is named exactly `<route>.test.ts`. `routes/**` sits inside the scanned `serverDir`,
  and only `ignore: ["**/*.test.ts"]` in `vite.config.ts` keeps it out of the server bundle — any
  other suffix ships a test as a live route. It is also what puts the test in the node-environment
  `server` vitest project; the `client` project excludes `routes/**`, and a misplaced test would run
  under jsdom and fail on server imports.
- The filename **is** the URL. `routes/api/healthz-smoke-bugfix-769466328.ts` serves
  `/api/healthz-smoke-bugfix-769466328` and nothing else; a stray suffix or a missing `/api/`
  segment silently yields the SPA shell again.

## D4 — No shared code, and therefore no ticket ordering

Each probe owns two new files and modifies none. The ownership maps are disjoint, so the three
tickets carry no `depends_on` and merge into the sprint branch in any order.

Do not factor the three handlers into a shared helper, factory, constants file or barrel export.
The duplication is deliberate and is the standing decision recorded in `ARCHITECTURE.md`
§ Key Decisions: independence is what lets each probe be built and merged without touching a file
another probe owns. This change adds nothing to that decision and does not amend it.

## D5 — No root doc fires a trigger this sprint

`PRODUCT.md` already describes the probe family generically, states that it deliberately carries no
count, and points at `openspec/specs/health-probes/` for the per-probe contract — three more probes
add no capability-map line and move no product identity. `ARCHITECTURE.md` is unchanged: the
topology, data model, integration points and cross-cutting constraints are untouched, and this
change makes no decision that binds work beyond itself. `DESIGN.md` is untouched — no token, type
scale, grid, interaction pattern or accessibility standard moves. `AGENTS.md` is human-authored and
never rewritten by an agent.

The one criterion that would have changed this — the VRTX3-I-0055 canvas's AC-10, asking for a
re-derived probe count in all three docs — is answered by the standing "Root docs carry no
per-sprint counts" decision, which removed those counts. See `proposal.md` § Follow-ups.
