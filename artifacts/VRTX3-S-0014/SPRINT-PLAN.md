# VRTX3-S-0014 — Bugfix sprint plan (index)

**Goal:** three `/api/healthz-smoke-*` probes reported missing are served, each returning
`{ ok: true, variant: "<id>" }` with `Content-Type: application/json`.

This file is an **index**. Each defect's reproduction, root-cause analysis, fixed interface
contract, Definition of Done and ownership map live in exactly one place — that defect's own
`PLAN.md`, linked below.

---

## Defects

| Key          | Route                                  | Variant       | Root cause (one line)                                                      | Plan                                           |
| ------------ | -------------------------------------- | ------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| VRTX3-T-0092 | `/api/healthz-smoke-bugfix-174694844`  | `"174694844"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0092/PLAN.md](./VRTX3-T-0092/PLAN.md) |
| VRTX3-T-0093 | `/api/healthz-smoke-bugfix2-754372119` | `"754372119"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0093/PLAN.md](./VRTX3-T-0093/PLAN.md) |
| VRTX3-T-0094 | `/api/healthz-smoke-bugfix3-404580234` | `"404580234"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0094/PLAN.md](./VRTX3-T-0094/PLAN.md) |

---

## Cross-cutting notes for the implementation agents

**1. The reported status code is wrong — re-measured this sprint, sixth consecutive time.**
All three tickets and the idea canvas state the paths return `404`. They do not. Measured on a
live `bun run dev` on 2026-08-10 from this branch:

```
/api/healthz-smoke-bugfix-174694844    → 200  text/html; charset=utf-8         <!doctype html>…  (SPA shell)
/api/healthz-smoke-bugfix2-754372119   → 200  text/html; charset=utf-8         <!doctype html>…  (SPA shell)
/api/healthz-smoke-bugfix3-404580234   → 200  text/html; charset=utf-8         <!doctype html>…  (SPA shell)
/api/healthz-smoke-841017405-a         → 200  application/json;charset=UTF-8   {"ok":true,"variant":"841017405"}   (control — exists)
```

An unmatched `/api/*` path falls through to the SPA `index.html` shell with **HTTP 200**, in dev
and in the production build alike. **The defects are real; only their stated status codes are
not.** Consequence: a `404 → 200` assertion proves nothing here — verify on the **response body
and `Content-Type`**. See [AGENT.md § Gotchas](../../AGENT.md#gotchas).

**2. Copy the `528856326` pair, not an older one.** Probe tests written before VRTX3-S-0011
(e.g. `healthz-smoke-913793173-a.test.ts`, and the plans of VRTX3-S-0012) carry a second
`responds in under 100ms` case. That wall-clock assertion is machine-dependent, is a known CI
flake source, and proves nothing about the contract. **Do not propagate it** — the current shape
is a single deep-equal body assertion. Copy source:
`routes/api/healthz-smoke-528856326-a.ts` + `.test.ts`.

**3. Keep the duplication.** Each probe is an independent, self-contained file: no shared handler,
factory, constants file or barrel export, no import from a sibling, no import from `db/`, no read
of `event.context`. This is a deliberate architectural decision
([ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions)) — factoring it out fails
the ticket.

**4. Filename is the URL.** A colocated unit test imports the handler module directly, so it
passes even if the filename — and therefore the route — is wrong. Only a live request against a
freshly started server proves the path is registered; the route table is built at scan time, so a
server already running will not see a new file.

**5. No shared files, no ordering.** The three ownership maps are disjoint (two new files each,
zero existing files modified), so **no `depends_on` is set** and all three can be built and merged
in parallel. Root docs are out of scope for every defect ticket in this sprint — `PRODUCT.md` and
`AGENT.md` were brought to their target state on the planning ticket (VRTX3-T-0095) and must not
be touched by a fix.

**6. Risk: very low.** Purely additive — 6 new files, 0 existing files modified. A repo-wide grep
for `174694844`, `754372119` and `404580234` returned zero matches each, so no new filename can
shadow or be shadowed by an existing route. `e2e/smoke.spec.ts` probes `/api/hello`, not this
family, so E2E impact is nil. The likeliest defect in this family is a stale variant id left over
from the copy source; the deep-equal assertion in each colocated test catches it.

---

## Follow-ups / out of scope

- **The idea canvas for VRTX3-I-0023 requires `PRODUCT.md` to be updated by the fix**
  ("the probe count under Features is incremented"). That criterion is not carried into any defect
  ticket: root docs are the planning role's exclusive responsibility and were updated on
  VRTX3-T-0095 in this same sprint. No action for implementation.
- **`404` keeps being reported for paths that return `200 text/html`** — six sprints running
  (VRTX3-S-0001, -0007, -0008, -0009, -0012, -0014). The mis-transcription originates upstream in
  defect capture, not in this repository, so there is nothing to fix here; `AGENT.md § Gotchas`
  now records the sixth occurrence so the next planner re-measures rather than trusts the report.
- **No genuinely distinct defect was surfaced** by root-causing these three. Nothing else to file.
