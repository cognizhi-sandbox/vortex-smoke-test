---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0046
idea: VRTX3-I-0055
branch: vortex/sprint/vrtx3-s-0046-9f6553fc
upstream: [artifacts/VRTX3-S-0046/SPRINT-PLAN.md, artifacts/VRTX3-S-0046/qa-test-report.md]
downstream: [artifacts/VRTX3-S-0046/release-notes.md]
---

# Sprint summary — VRTX3-S-0046

Sprint goal: `[smoke] Bugfix sprint smoke-bugfix-178771464562768`. Type: BUGFIX.

Only VRTX3-T-0309 traces to an idea (VRTX3-I-0055); VRTX3-T-0307 and VRTX3-T-0308 have no idea
linked. The frontmatter names the one that exists.

## Tickets

| Ticket       | Type   | Title                                           | Outcome                   |
| ------------ | ------ | ----------------------------------------------- | ------------------------- |
| VRTX3-T-0310 | TASK   | Bugfix plan — VRTX3-S-0046                      | DONE (`32bf078`)          |
| VRTX3-T-0307 | DEFECT | `/api/healthz-smoke-bugfix-769466328` unrouted  | DONE (PR #324, `6c241d9`) |
| VRTX3-T-0309 | DEFECT | `/api/healthz-smoke-bugfix3-238143877` unrouted | DONE (PR #326, `66a8111`) |
| VRTX3-T-0308 | DEFECT | `/api/healthz-smoke-bugfix2-101945976` unrouted | DONE (PR #325, `85d416d`) |
| VRTX3-T-0311 | TASK   | Integration QA report — VRTX3-S-0046            | DONE (PR #327, `487daf1`) |
| VRTX3-T-0312 | TASK   | Sprint close bundle — VRTX3-S-0046              | This artifact             |

No EPIC or STORY — correct for a BUGFIX sprint. The three committed DEFECTs were refined in place
during planning; no ticket was created at any point in the sprint.

## What shipped

Sprint goal met. Three health probes that answered the SPA shell now answer JSON:

| Endpoint                               | Body                                | Ticket       |
| -------------------------------------- | ----------------------------------- | ------------ |
| `/api/healthz-smoke-bugfix-769466328`  | `{"ok":true,"variant":"769466328"}` | VRTX3-T-0307 |
| `/api/healthz-smoke-bugfix2-101945976` | `{"ok":true,"variant":"101945976"}` | VRTX3-T-0308 |
| `/api/healthz-smoke-bugfix3-238143877` | `{"ok":true,"variant":"238143877"}` | VRTX3-T-0309 |

Six new source files, zero existing source files modified. `git diff --stat 2b8bb3e..HEAD` over the
sprint's fork point shows 23 files changed, **1176 insertions and 0 deletions**;
`git diff --name-status` returns no entry that is not an `A`. The probe family moved 142 → 145
handlers, matching the baseline recorded in the change's `design.md` § Measured context exactly; the
test-file count moved 149 → 152.

Re-verified at close on the integrated branch: `bun run verify` exit `0`, **152 test files, 212
tests passing**, lint clean at `--max-warnings 0`, typecheck clean.

All nine `tasks.md` checkboxes are stamped, three per ticket — the platform found every key, so the
tagging held.

## Divergence from plan

None material. The three fixed interface contracts were delivered verbatim: each handler imports
only `nitro/h3`, returns the bare numeric `variant` as a string with no extra keys, carries no
method guard, and shares no code with any sibling. `grep -c toBeLessThan` over the three new test
files returns `0` for each.

Three points are worth recording.

**D1 — The copy-source pointer was correct upstream for once, and the substitution was still made.**
VRTX3-I-0055 named the pinned `healthz-smoke-528856326-a` pair itself _and_ warned against sampling
a neighbouring `bugfix3-*` file — the third canvas to get this right, after VRTX3-I-0040 and
VRTX3-I-0044. It also quoted `healthz-smoke-bugfix3-583276571.ts` as a working sibling; that is a
**handler**, which cannot carry the wall-clock case, so it was never exposure. Both it and the
pinned pair were diffed at planning and found clean. All three implementation agents copied the
pinned pair and said so in their fix notes. The check cost one diff, which is what it costs when the
pointer is wrong.

**D2 — The sixth scenario is now a three-sprint inheritance.** "An unrouted path is distinguishable
only by body, not by status" appears on all three requirements in this sprint's delta, as it did in
VRTX3-S-0044's and VRTX3-S-0045's. QA verified it live for all three probes against a deliberately
unrouted control path (`/api/healthz-smoke-nonexistent-path` → `200 text/html`). What was prose each
sprint re-wrote is now an inherited contract clause, which is the cheaper form.

**D3 — The delta was `ADDED`, not `MODIFIED`, for the same genuine reason as the last two sprints.**
`openspec/specs/health-probes/spec.md` carries 15 requirements and **zero** occurrences of
`healthz-smoke-bugfix`, so there was no requirement to attach a regression scenario to. R5 below is
why that is still true, and why it is now worse than when VRTX3-S-0045 recorded it.

**Root docs unchanged this sprint** — the sixth consecutive sprint requiring no edit. See below.

## Root docs

No trigger fired, and no root-doc line is now inaccurate. Verified rather than assumed:
`grep -n '769466328\|101945976\|238143877'` across all four root docs returns nothing, so no
document names a path this sprint changed.

- **`PRODUCT.md`** — the Health probes capability line already describes the family without counting
  it, and § Health probe endpoints states explicitly that the document "deliberately carries no
  count and no 'most recent' pointer". Restoring three instances of an existing capability adds no
  line.
- **`ARCHITECTURE.md`** — § Health probe route contract already states the filename-is-the-URL
  contract. `## Key Decisions` gains nothing: "Health probes duplicate, on purpose" governed this
  sprint as written and predicted the decomposition exactly — three tickets, two new files each,
  zero `depends_on` edges, delivered in an order (0307, 0309, 0308) unrelated to their keys.
- **`DESIGN.md`** — an API-only change touches no token, type scale, grid, interaction pattern or
  accessibility standard. VRTX3-I-0055's design manifest is empty (`blocks: []`), so "unchanged"
  means reviewed and found to have no visual surface, and nothing was exported to
  `artifacts/VRTX3-S-0046/design/` because there was nothing to export.
- **`AGENTS.md`** — human-authored; read, never written. Its probe-family count is stale again (it
  says 124; the filesystem says 145). `.vortex/agents-generated.md` already records this drift and
  explicitly declines to maintain a running figure, so it was **not** re-stamped for a fifth time.
  The durable statement stands: 47 legacy timing tests out of a family that grows every sprint — the
  numerator is still exactly 47.

**On the "dated Changelog entry" clause in this ticket's acceptance criteria.** The sprint did change
observable behaviour, so that clause is live — but the standing role rule is that root docs carry no
new changelog entries, because the commit message already carries the change narrative, dated and
attributed. Where a ticket instruction and the standing contract conflict, the contract wins and the
conflict gets named, which is what this paragraph does. It is also what the repository has actually
done: the last entry in each root doc's § Changelog is VRTX3-S-0039, and the six sprints since added
none. Existing changelog sections are left in place as history.

## Retrospective

**Went well**

- **R1 — Zero defects at integration QA, and no rework on any ticket.** All 18 delta-spec scenarios
  passed on first check, across unit tests, production-build route inclusion, live-server
  body/`Content-Type` checks and the full E2E suite (6/6). `integration-defects-resolution.md`
  records an empty table.
- **R2 — Ownership maps stayed disjoint, and the merge order proved it again.** VRTX3-T-0307 landed
  first, then -0309, then -0308 — ticket keys out of order, no `depends_on` edge, no conflict, no
  rebase. Third consecutive sprint where the merge order is itself the evidence.
- **R3 — The plan's overrides were followed without re-litigation.** Status code, copy source and
  the no-timing-assertion rule each contradicted something in a ticket's text; three independent
  agents carried out all three and recorded the reason — not just the instruction — in their fix
  notes. Nothing had to be corrected at QA.
- **R4 — QA's scenario arithmetic was right for the second consecutive sprint.** The report states
  18 scenarios and enumerates 18 `SCENARIO-VERDICT` lines. It also declared its own two deviations
  from the canonical template (seven sections rather than eight; `idea` frontmatter naming a
  non-governing idea) rather than leaving them to be discovered.

**Could improve**

- **R5 — The spec-of-record gap from VRTX3-S-0045's R5 recurred, and is now three sprints deep.**
  This remains the most consequential finding of the close and it is not about this sprint's code.
  Observed at this close: `openspec/specs/health-probes/spec.md` still holds **15** requirements and
  **zero** occurrences of `healthz-smoke-bugfix`; `openspec/changes/` holds **three** un-archived
  bugfix changes (`vrtx3-s-0044-…`, `vrtx3-s-0045-…`, `vrtx3-s-0046-…`), while
  `openspec/changes/archive/` holds the same five idea-keyed enhancement changes it held a sprint
  ago (`vrtx3-i-0047` … `-0051`) and nothing since. VRTX3-S-0044's and VRTX3-S-0045's land commits
  are both on `dev`, so both sprints landed. The hypothesis VRTX3-S-0045 recorded — that the
  archive/spec-merge step keys off the idea-derived change-id shape and does not match the
  sprint-keyed `vrtx3-s-00NN-smoke-bugfix-sprint-smoke-b` id — is now consistent with three data
  points rather than one, but it is **still a hypothesis**: the archiving mechanism was not
  inspected, and this ticket is forbidden from touching anything under `openspec/`. Carried as F1.
  The cost compounds exactly as predicted: nine requirements and 54 scenarios across three sprints
  are written and validated but will not be inherited, and each subsequent bugfix sprint keeps
  choosing `ADDED` over `MODIFIED` — correctly, on the evidence available to it — because the
  requirements it should be modifying are not there to find.
- **R6 — Fix-note frontmatter drifted the same way as last sprint, and one file lost it entirely.**
  VRTX3-T-0307's fix note and all three `tdd-test-result.md` files but one use the
  `artifact-conventions` identity block. VRTX3-T-0308's and VRTX3-T-0309's fix notes instead use the
  `name` / `description` / `metadata` shape — the memory-file frontmatter, not the artifact one —
  and VRTX3-T-0309's `tdd-test-result.md` carries **no frontmatter at all**. Same 2-of-3 ratio as
  VRTX3-S-0045's R6, same substitution, plus one new omission. The prose is complete in every case;
  what is missing is the machine-readable lineage. Two sprints of the identical failure across six
  independent agents is evidence the convention is not reaching the implementation dispatch, not
  that agents are slipping.
- **R7 — The `404` mis-transcription arrived on all three tickets again.** Planning re-measured and
  found `200 text/html` (949-byte SPA shell) on all three paths against a control returning
  `200 application/json` — the thirtieth consecutive confirmation by the counter kept in this
  sprint's `design.md` § D1. Every sprint pays the same live re-measurement to debunk the same wrong
  status code; the fix belongs upstream in defect capture. D2 above is the durable in-repo
  mitigation and is now three sprints old.
- **R8 — The uneven-capture split recurred, shape unchanged**: VRTX3-T-0307 and VRTX3-T-0308 had no
  idea linked and asserted `404` unchecked, while VRTX3-T-0309's canvas (VRTX3-I-0055) root-caused
  the missing file correctly, predicted the SPA-shell fallback itself, stated plainly that it could
  measure nothing (nothing listening on `:5000`–`:5002` or `:3000` in its capture container) — and
  still headlined `404`. The grounded half is not the safer half; it is the half that shows its work.
  **Counter discrepancy worth flagging:** this sprint's `design.md` § D1 calls it the seventh
  instance; VRTX3-S-0045's summary called its own the ninth. The two count different series from
  different start points and neither is maintained centrally, so the ordinal in any one document is
  not comparable with another's. Carried as F5 — the observation is robust, the numbering is not.
- **R9 — The ticket-description root-doc filter stripped the change-id line for the third
  consecutive sprint.** Planning's first update to all three tickets silently dropped the line
  reading "read that change directory's `design.md` first", because it contains the substring
  `design.md` — the OpenSpec change's technical-decisions document, not root `DESIGN.md`. The
  response `note` reported the strip, so it was caught and reworded ("that change directory's
  technical-decisions document"), but the workaround is now three sprints old with no change in
  between. Matching on path rather than filename would remove it entirely.
- **R10 — Five containers, three dev-server ports, two collisions on one number** (planning `:5006`,
  VRTX3-T-0307 `:5005`, VRTX3-T-0308 `:5005`, VRTX3-T-0309 `:5004`, QA `:5004`). Every agent read
  its own Vite banner and none assumed, so nothing went wrong. Recorded because two containers
  landing on the same number is the case most likely to be mistaken for a sprint-level fact — the
  port is per container, and this sprint has no single port.

## Follow-ups carried out of this sprint

None is an open defect and none blocked the close — planning has no DEFECT-creation authority, so
all are left for a future sprint:

- **F1** — the archive/spec-merge gap in R5, now three sprints deep. Nine requirements and 54
  scenarios from three BUGFIX sprints are not in `openspec/specs/`, and three sprint-keyed changes
  sit un-archived. Needs someone who can inspect the archiving step; this ticket may not write under
  `openspec/`. Carried unchanged from VRTX3-S-0045 F1.
- **F2** — the `healthz-smoke-bugfix*` subfamily is now 74 numbered variants. Nine have been
  specified across three sprints, and by R5 none of those nine is yet in the spec of record.
- **F3** — 47 tests in the probe family carry a wall-clock assertion. They are never rewritten by
  policy, so the ratio only improves by dilution as the family grows (47 of 145 now); a one-off
  sweep would retire the recurring copy-source hazard at its source.
- **F4** — the defect-capture gap behind R7 and R8: unlinked defect tickets carrying unverified
  status codes.
- **F5** — new this sprint: the recurrence counters in `AGENTS.md`, in each sprint's `design.md` and
  in each sprint summary run independently and disagree (R8). Either pick one home for them or drop
  the ordinals and keep the observations.

## Open defects

**None.** Integration QA found zero defects; `integration-defects-resolution.md` records an empty
table with `INTEGRATION_DEFECTS_RESOLUTION: COMPLETE`. This ticket's description carries no
"Conditionally approved" notice, so there are no known issues to carry past close.
