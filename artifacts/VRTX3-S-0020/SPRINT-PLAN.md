# VRTX3-S-0020 — Bugfix sprint plan (index)

**Goal:** three `/api/healthz-smoke-*` probes reported missing are served, each returning
`{ ok: true, variant: "<id>" }` with `Content-Type: application/json`.

This file is an **index**. Each defect's reproduction, root-cause analysis, fixed interface
contract, Definition of Done and ownership map live in exactly one place — that defect's own
`PLAN.md`, linked below.

---

## Defects

| Key          | Route                                  | Variant        | Root cause (one line)                                                      | Plan                                           |
| ------------ | -------------------------------------- | -------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| VRTX3-T-0137 | `/api/healthz-smoke-bugfix-1060413982` | `"1060413982"` | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0137/PLAN.md](./VRTX3-T-0137/PLAN.md) |
| VRTX3-T-0138 | `/api/healthz-smoke-bugfix2-521525844` | `"521525844"`  | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0138/PLAN.md](./VRTX3-T-0138/PLAN.md) |
| VRTX3-T-0139 | `/api/healthz-smoke-bugfix3-287868165` | `"287868165"`  | Handler file was never written; Nitro resolves routes from the filesystem. | [VRTX3-T-0139/PLAN.md](./VRTX3-T-0139/PLAN.md) |

---

## Cross-cutting notes for the implementation agents

**1. The reported status code is wrong — re-measured this sprint, twelfth consecutive time.**
All three tickets state the paths return `404`. They do not. Measured on this branch against a
live dev server on 2026-08-11 (Vite bound `:5000` here — but **read the banner**, the last three
sprints bound `:5005`, `:5006` and `:5007`):

```
/api/healthz-smoke-bugfix-1060413982   → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-bugfix2-521525844   → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-bugfix3-287868165   → 200  text/html; charset=utf-8         <!doctype html>…  949 bytes (SPA shell)
/api/healthz-smoke-528856326-a         → 200  application/json;charset=UTF-8   {"ok":true,"variant":"528856326"}  33 bytes (control — exists)
```

An unmatched `/api/*` path is answered by the SPA `index.html` shell with **HTTP 200**, in dev and
in the production build alike. **The defects are real; only their stated status codes are not.**
Consequence: a `404 → 200` assertion proves nothing here — verify on the **response body and
`Content-Type`**. See [AGENT.md § Gotchas](../../AGENT.md#gotchas).

The now-familiar split repeats: VRTX3-T-0139's canvas (VRTX3-I-0029) flagged its own `404` as a
likely mis-transcription and asked for a live measurement. VRTX3-T-0137 and VRTX3-T-0138 have no
idea linked and assert `404` verbatim. You cannot tell which kind of report you hold without
measuring — so the measurement above was taken for all three.

**2. Copy the `528856326` pair, not an older one.** Probe tests written before VRTX3-S-0011
(e.g. `healthz-smoke-913793173-a.test.ts`, `healthz-smoke-126862920-c.test.ts`) carry a second
`responds in under 100ms` case. That wall-clock assertion is machine-dependent, is a known CI flake
source, and proves nothing about the contract. **Do not propagate it** — the current shape is a
single deep-equal body assertion. Copy source: `routes/api/healthz-smoke-528856326-a.ts` +
`.test.ts`. VRTX3-I-0029 names this pair itself, so there is no substitution to make.

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
(VRTX3-T-0140) and must not be touched by a fix.

**6. Risk: very low.** Purely additive — 6 new files, 0 existing files modified. A repo-wide grep
for `1060413982`, `521525844` and `287868165` returned zero matches each, so these are never-written
files rather than typo'd filenames, and no new filename can shadow or be shadowed by an existing
route. `e2e/smoke.spec.ts:27` probes `/api/hello`, not this family, so E2E impact is nil. The
likeliest defect in this family is a stale variant id left over from the copy source; the deep-equal
assertion in each colocated test catches it.

---

## Follow-ups / out of scope

- **Probe-family doc count.** The count `71` is carried in `AGENT.md` § Health Probe Routes,
  `ARCHITECTURE.md` § Routing and `PRODUCT.md` § Features. Re-derived from the filesystem this
  sprint (71 handlers before the fixes) and updated to 74 in all three docs on this planning
  ticket. Root docs are not in any defect ticket's scope — no action for implementation.
- **Stale line reference in VRTX3-I-0029.** The canvas cites the Nitro config at
  `vite.config.ts:31`; it is actually at `vite.config.ts:29`. The quoted content is correct
  (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`) — only the line number drifted. Not a
  defect, recorded so the next reader is not confused.
- **`404` keeps being reported for paths that return `200 text/html`** — twelve sprints running
  (VRTX3-S-0001, -0007, -0008, -0009, -0012, -0014, -0015, -0016, -0017, -0018, -0019, -0020). The
  mis-transcription originates upstream in defect capture, not in this repository, so there is
  nothing to fix here. Recorded so the next planner re-measures rather than trusts a report.
- **No genuinely distinct defect was surfaced** by root-causing these three. Nothing else to
  record.
