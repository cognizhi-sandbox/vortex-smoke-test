# VRTX3-S-0018 — Bugfix sprint plan (index)

**Goal:** three `/api/healthz-smoke-*` probes reported missing are served, each returning
`{ ok: true, variant: "<id>" }` with `Content-Type: application/json`.

This file is an **index**. Each defect's reproduction, root-cause analysis, fixed interface
contract, Definition of Done and ownership map live in exactly one place — that defect's own
`PLAN.md`, linked below.

---

## Defects

| Key          | Route                                  | Variant       | Root cause (one line)                                                      | Plan                                           |
| ------------ | -------------------------------------- | ------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| VRTX3-T-0123 | `/api/healthz-smoke-bugfix-699186705`  | `"699186705"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0123/PLAN.md](./VRTX3-T-0123/PLAN.md) |
| VRTX3-T-0124 | `/api/healthz-smoke-bugfix2-502272230` | `"502272230"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0124/PLAN.md](./VRTX3-T-0124/PLAN.md) |
| VRTX3-T-0125 | `/api/healthz-smoke-bugfix3-850084489` | `"850084489"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0125/PLAN.md](./VRTX3-T-0125/PLAN.md) |

---

## Cross-cutting notes for the implementation agents

**1. The reported status code is wrong — re-measured this sprint, tenth consecutive time.**
All three tickets state the paths return `404`. They do not. Measured on this branch against a
live dev server on 2026-08-10 (the dev server bound `:5006`; `5000`–`5005` were taken — read the
Vite banner rather than assuming the port):

```
/api/healthz-smoke-bugfix-699186705    → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-bugfix2-502272230   → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-bugfix3-850084489   → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-528856326-a         → 200  application/json;charset=UTF-8   {"ok":true,"variant":"528856326"}   (control — exists)
```

An unmatched `/api/*` path falls through to the SPA `index.html` shell with **HTTP 200**, in dev
and in the production build alike. **The defects are real; only their stated status codes are
not.** Consequence: a `404 → 200` assertion proves nothing here — verify on the **response body
and `Content-Type`**. See [AGENT.md § Gotchas](../../AGENT.md#gotchas).

Worth noting: the idea canvas behind VRTX3-T-0125 (VRTX3-I-0027) carried the correct measurement
itself and explicitly flagged its own `404` as a mis-transcription. The two sibling tickets
(VRTX3-T-0123, VRTX3-T-0124) have no idea link and still assert `404` verbatim.

**2. Copy the `528856326` pair, not an older one.** Probe tests written before VRTX3-S-0011
(e.g. `healthz-smoke-913793173-a.test.ts`, `healthz-smoke-126862920-c.test.ts`) carry a second
`responds in under 100ms` case. That wall-clock assertion is machine-dependent, is a known CI flake
source, and proves nothing about the contract. **Do not propagate it** — the current shape is a
single deep-equal body assertion. Copy source: `routes/api/healthz-smoke-528856326-a.ts` +
`.test.ts`.

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
in parallel. Root docs are out of scope for every defect ticket in this sprint — `AGENT.md`,
`PRODUCT.md` and `ARCHITECTURE.md` were brought to their target state on this planning ticket
(VRTX3-T-0126) and must not be touched by a fix.

**6. Risk: very low.** Purely additive — 6 new files, 0 existing files modified. A repo-wide grep
for `699186705`, `502272230` and `850084489` returned zero matches each, so these are never-written
files rather than typo'd filenames, and no new filename can shadow or be shadowed by an existing
route. `e2e/smoke.spec.ts:27` probes `/api/hello`, not this family, so E2E impact is nil. The
likeliest defect in this family is a stale variant id left over from the copy source; the deep-equal
assertion in each colocated test catches it.

---

## Follow-ups / out of scope

- **Probe-family doc count.** The count `65` is carried in `AGENT.md` § Health Probe Routes,
  `ARCHITECTURE.md` § Routing and `PRODUCT.md` § Features. Re-derived from the filesystem this
  sprint (65 handlers before the fixes) and updated to 68 in all three docs on this planning
  ticket. Root docs are not in any defect ticket's scope — no action for implementation.
- **`404` keeps being reported for paths that return `200 text/html`** — ten sprints running
  (VRTX3-S-0001, -0007, -0008, -0009, -0012, -0014, -0015, -0016, -0017, -0018). The
  mis-transcription originates upstream in defect capture, not in this repository, so there is
  nothing to fix here. Upstream capture is improving unevenly: VRTX3-I-0027 caught its own
  mis-transcription and published the correct measurement, while the two ticket descriptions with
  no idea behind them repeated the `404` unchecked. Nothing actionable in this repo; recorded so
  the next planner re-measures rather than trusts a report.
- **No genuinely distinct defect was surfaced** by root-causing these three. Nothing else to
  record.
