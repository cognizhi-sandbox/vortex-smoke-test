---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0034
idea: VRTX3-I-0041
branch: vortex/sprint/vrtx3-s-0034-96262b30
upstream: [artifacts/VRTX3-S-0034/qa-test-report.md]
downstream: [artifacts/VRTX3-S-0034/release-notes.md]
---

# Sprint summary — VRTX3-S-0034

**Goal:** `[smoke] Bugfix sprint smoke-bugfix-178747715613700` — restore three unreachable health
probes so each answers `Content-Type: application/json` with `{"ok":true,"variant":"<id>"}`.

**Status:** CLOSED. All three defects fixed, integration and QA passed with zero defects found,
sprint branch landing on `dev`.

## What shipped

Three health probes that had no handler file, each now returning its own variant:

| Ticket       | Endpoint                               | Body                                |
| ------------ | -------------------------------------- | ----------------------------------- |
| VRTX3-T-0221 | `/api/healthz-smoke-bugfix-839771954`  | `{"ok":true,"variant":"839771954"}` |
| VRTX3-T-0222 | `/api/healthz-smoke-bugfix2-554747562` | `{"ok":true,"variant":"554747562"}` |
| VRTX3-T-0223 | `/api/healthz-smoke-bugfix3-238311955` | `{"ok":true,"variant":"238311955"}` |

**6 new files, 0 existing source files modified**, no dependency change, nothing in `src/`. Each
probe is one handler plus one colocated unit test, importing only `nitro/h3` — no `db/`, no
`event.context` read, no method guard, no shared helper. Probe family 106 → 109; `routes/api/`
215 → 221 files.

## Root cause

Identical for all three: the handler file was never written. Nitro builds its route table by
scanning the project root (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`,
`vite.config.ts:29`), so a path with no file never reaches a handler. A repo-wide grep for each
variant id returned zero matches before the fix. No broken code existed to repair — the fix is
purely additive, which is why the three tickets had disjoint ownership maps and no `depends_on`
edge between them.

## Verification

Gate re-run first-hand at close on the integrated branch: `bun run verify` → exit 0, lint clean
under `--max-warnings 0`, `tsc --build` clean, **116 test files / 176 tests passed**.

Validation's own pass (`qa-test-report.md`, verdict PASS) additionally covered `bun run build` and
the E2E tier — `6 passed (4.3s)`, 0 failed, 0 skipped — plus live requests confirming all three
probes return `200 application/json;charset=UTF-8` with the exact expected body. Zero defects were
found during integration QA (`integration-defects-resolution.md`, empty summary table).

## Two upstream claims that did not survive re-verification

Both were caught at planning, carried into the ticket contracts, and independently confirmed by all
three implementing agents.

**The reported `404`s were wrong.** All three paths actually returned `200 text/html` (the 949-byte
SPA shell) before the fix, because an unmatched `/api/*` path falls through to the SPA. A
`404 → 200` check would have passed whether or not the route existed, so every acceptance criterion
was written against body plus `Content-Type` instead. This is the twenty-fourth consecutive sprint
to confirm the behavior and the fifth with a mixed capture — one grounded canvas (VRTX3-I-0041),
two defects with no idea linked at all.

**The canvas's copy source carried a flaky assertion.** VRTX3-I-0041 named
`healthz-smoke-bugfix3-993514120`, whose test contains `expect(elapsed).toBeLessThan(100)`, and
pinned that shape into its own AC-4. Planning substituted the pinned `healthz-smoke-528856326-a`
pair per `AGENTS.md` § Health Probe Routes and dropped AC-4 — the no-I/O property it reaches for
comes from the interface contract, not a wall-clock check on a shared runner. QA verified none of
the three new tests carries the timing case.

## Root docs

All four were brought to target state on the planning ticket (`3ea20f8`) with dated Changelog
entries, before any fix ticket existed. Re-checked at close against the landed branch: the
probe-family count in `AGENTS.md`, `ARCHITECTURE.md` and `PRODUCT.md` reads 109, and the filesystem
holds 109 handlers and 221 files under `routes/api/` — the predictive figures written at planning
are now accurate as written. No further root-doc change was needed at close.

## Known issues

**None.** QA returned PASS with zero defects; no ticket closed conditionally and none was deferred.
Two items are recorded as out-of-scope follow-ups in `SPRINT-PLAN.md`, neither a defect in shipped
behavior:

- `README.md:457` still links to `./AGENT.md`, dead since the manual's rename in `600b74f`. The four
  root docs' 19 equivalents were repaired at planning; `README.md` is not planning-owned, so it was
  left for a ticket already editing that file.
- `routes/api/` directory growth (221 files). Not a defect — the duplication is a deliberate,
  documented decision (`ARCHITECTURE.md` § Key Decisions).

## Retrospective

### What went well

- **The copy-source pointer worked end-to-end, on the case where it mattered.** This was the second
  _harmful_ instance of the drift (after VRTX3-I-0037) — a canvas naming a legacy template and
  propagating its flaky assertion into an acceptance criterion. Last time it reached the written
  code. This time planning caught it, all three implementing agents independently applied the
  substitution and said so in their fix notes, and QA explicitly verified the absence of the timing
  case. A documentary mitigation held across four agents who never spoke to each other.
- **Measuring beat trusting, again.** Every `404` in this sprint's inputs was wrong. The habit of
  re-measuring rather than reasoning from the report is what kept a useless `404 → 200` assertion
  out of three acceptance criteria.
- **Disjoint ownership paid off exactly as designed.** Three tickets, two new files each, no
  `depends_on` edge, three parallel merges, zero conflicts and zero rework cycles.
- **Plans were followed without escalation.** No implementing agent raised a plan-revision request,
  and all three fix notes confirm rather than correct the RCA.

### What could improve

- **The 47 legacy timing tests are the actual root cause here, and nobody owns removing them.** The
  ratio only dilutes as the family grows (47 of 109 now); it never improves, because those files are
  never rewritten. Every sprint pays a fresh documentation-lookup cost, and roughly every other
  canvas that samples the directory lands on one. A one-time sweep deleting the 47 timing cases
  would retire the hazard permanently. The honest counter-argument is that it would touch 47 files
  at once and break the "a probe never changes after it lands" property the family exists to
  demonstrate — so it is a real tradeoff, not an oversight, and it deserves an explicit decision
  rather than another sprint of drift.
- **The `404` mis-transcription originates upstream in defect capture and cannot be fixed here.**
  Twenty-four sprints have now confirmed the same thing. Two of this sprint's three defects had no
  idea canvas at all, so nothing upstream even had a chance to check. The durable fix is in the
  capture tooling.
- **Canvas quality does not predict this failure mode.** VRTX3-I-0041 is the best-evidenced canvas
  the family has produced — it greps the variant id, quotes the sibling handler in full, diagrams
  the routing fall-through, and warns against stale copy-paste — and it was still wrong about the
  status code, the copy source and one acceptance criterion. Reviewing a canvas more carefully would
  not have caught any of the three; only reading the repo did.
