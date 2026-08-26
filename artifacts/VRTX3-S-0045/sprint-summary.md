---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0045
idea: VRTX3-I-0054
branch: vortex/sprint/vrtx3-s-0045-4cae88d7
upstream: [artifacts/VRTX3-S-0045/SPRINT-PLAN.md, artifacts/VRTX3-S-0045/qa-test-report.md]
downstream: [artifacts/VRTX3-S-0045/release-notes.md]
---

# Sprint summary — VRTX3-S-0045

Sprint goal: `[smoke] Bugfix sprint smoke-bugfix-178771266552323`. Type: BUGFIX.

Only VRTX3-T-0303 traces to an idea (VRTX3-I-0054); VRTX3-T-0301 and VRTX3-T-0302 have no idea
linked. The frontmatter names the one that exists.

## Tickets

| Ticket       | Type   | Title                                           | Outcome                   |
| ------------ | ------ | ----------------------------------------------- | ------------------------- |
| VRTX3-T-0304 | TASK   | Bugfix plan — VRTX3-S-0045                      | DONE (`4ea34b6`)          |
| VRTX3-T-0301 | DEFECT | `/api/healthz-smoke-bugfix-1022589408` unrouted | DONE (PR #319, `b7d224e`) |
| VRTX3-T-0303 | DEFECT | `/api/healthz-smoke-bugfix3-583276571` unrouted | DONE (PR #320, `3ed3e4b`) |
| VRTX3-T-0302 | DEFECT | `/api/healthz-smoke-bugfix2-448657707` unrouted | DONE (PR #321, `8d3e3b8`) |
| VRTX3-T-0305 | TASK   | Integration QA report — VRTX3-S-0045            | DONE (PR #322, `039126a`) |
| VRTX3-T-0306 | TASK   | Sprint close bundle — VRTX3-S-0045              | This artifact             |

No EPIC or STORY — correct for a BUGFIX sprint. The three committed DEFECTs were refined in place
during planning; no ticket was created at any point in the sprint.

## What shipped

Sprint goal met. Three health probes that answered the SPA shell now answer JSON:

| Endpoint                               | Body                                 | Ticket       |
| -------------------------------------- | ------------------------------------ | ------------ |
| `/api/healthz-smoke-bugfix-1022589408` | `{"ok":true,"variant":"1022589408"}` | VRTX3-T-0301 |
| `/api/healthz-smoke-bugfix2-448657707` | `{"ok":true,"variant":"448657707"}`  | VRTX3-T-0302 |
| `/api/healthz-smoke-bugfix3-583276571` | `{"ok":true,"variant":"583276571"}`  | VRTX3-T-0303 |

Six new source files, zero existing source files modified. `git diff --stat 77ec28f..HEAD` over the
sprint's fork point shows 23 files changed, **1153 insertions and 0 deletions**;
`git diff --name-status` returns no entry that is not an `A`. The probe family moved 139 → 142
handlers, matching the baseline recorded in the change's `design.md` § Measured context exactly; the
test-file count moved 146 → 149.

Re-verified at close on the integrated branch: `bun run verify` exit `0`, **149 test files, 209
tests passing**, lint clean at `--max-warnings 0`, typecheck clean.

All nine `tasks.md` checkboxes are stamped, three per ticket — the platform found every key, so the
tagging held.

## Divergence from plan

None material. The three fixed interface contracts were delivered verbatim: each handler imports
only `nitro/h3`, returns the bare numeric `variant` as a string with no extra keys, carries no
method guard, and shares no code with any sibling. `grep -l toBeLessThan` over the three new test
files returns no match.

Three points are worth recording.

**D1 — The copy-source substitution propagated intact, in its harmless form.** VRTX3-I-0054 named
`healthz-smoke-bugfix3-1056287485.{ts,test.ts}` — the pair VRTX3-S-0044 itself shipped one sprint
earlier, so it postdates VRTX3-S-0011 and carries no wall-clock timing case. It was diffed at
planning and found clean, meaning following the canvas would have cost nothing this time. The pinned
`healthz-smoke-528856326-a` pair was used regardless, and all three implementation agents copied it
and said so in their fix notes. This is the seventh harmless instance against three harmful.

**D2 — The sixth scenario introduced by VRTX3-S-0044 was carried forward rather than re-derived.**
"An unrouted path is distinguishable only by body, not by status" appears on all three requirements
in this sprint's delta, as it did in the last. Two sprints is not yet a convention, but it is the
first time the `404` lesson has propagated as an inherited contract instead of as prose each sprint
re-writes. QA verified it live for all three probes against a deliberately unrouted control path.

**D3 — The delta was `ADDED`, not `MODIFIED`, for the same genuine reason as last sprint.**
`openspec/specs/health-probes/spec.md` carries 15 requirements and **zero** occurrences of
`healthz-smoke-bugfix`, so there was no requirement to attach a regression scenario to. See R5 below
for why that count is not what VRTX3-S-0044 expected it to be.

**Root docs unchanged this sprint** — the fifth consecutive sprint requiring no edit. See below.

## Root docs

No trigger fired, and no root-doc line is now inaccurate. Verified rather than assumed:
`grep -n '1022589408\|448657707\|583276571'` across all four root docs returns nothing, so no
document names a path this sprint changed.

- **`PRODUCT.md`** — the Health probes capability line already describes the family without counting
  it, and § Health probe endpoints states explicitly that the document "deliberately carries no
  count and no 'most recent' pointer". Restoring three instances of an existing capability adds no
  line.
- **`ARCHITECTURE.md`** — § Health probe route contract already states the filename-is-the-URL
  contract. `## Key Decisions` gains nothing: "Health probes duplicate, on purpose" governed this
  sprint as written and predicted the decomposition exactly — three tickets, two new files each,
  zero `depends_on` edges, delivered in an order (0301, 0303, 0302) unrelated to their keys.
- **`DESIGN.md`** — an API-only change touches no token, type scale, grid, interaction pattern or
  accessibility standard. VRTX3-I-0054's design manifest is empty (`blocks: []`), so "unchanged"
  means reviewed and found to have no visual surface, and nothing was exported to
  `artifacts/VRTX3-S-0045/design/` because there was nothing to export.
- **`AGENTS.md`** — human-authored; read, never written. Its probe-family count is stale again (it
  says 124; the filesystem says 142). `.vortex/agents-generated.md` already records this drift and
  explicitly declines to maintain a running figure, so it was **not** re-stamped for a fourth time.
  The durable statement stands: 47 legacy timing tests out of a family that grows every sprint — the
  numerator is still exactly 47.

**On the "dated Changelog entry" clause in this ticket's acceptance criteria.** The sprint did change
observable behaviour, so that clause is live — but the standing role rule is that root docs carry no
new changelog entries, because the commit message already carries the change narrative, dated and
attributed. Where a ticket instruction and the standing contract conflict, the contract wins and the
conflict gets named, which is what this paragraph does. It is also what the repository has actually
done: the last entry in each root doc's § Changelog is VRTX3-S-0039, and the five sprints since added
none. Existing changelog sections are left in place as history.

## Retrospective

**Went well**

- **R1 — Zero defects at integration QA, and no rework on any ticket.** All 18 delta-spec scenarios
  passed on first check, across unit tests, production-build route inclusion, live-server
  body/`Content-Type` checks and the full E2E suite. `integration-defects-resolution.md` records an
  empty table.
- **R2 — Ownership maps stayed disjoint, and the merge order proved it.** VRTX3-T-0301 landed first,
  then -0303, then -0302 — ticket keys out of order, no `depends_on` edge, no conflict, no rebase.
  Second consecutive sprint where the merge order is itself the evidence.
- **R3 — The plan's three overrides were followed without re-litigation.** Copy source, status code
  and the no-timing-assertion rule each contradicted something in the source canvas or the ticket
  text, and three independent agents carried out all three and recorded the reason — not just the
  instruction — in their own fix notes. Nothing had to be corrected at QA.
- **R4 — VRTX3-S-0044's R5 did not recur.** Last sprint's QA report mis-stated its scenario count
  ("15", against 18 enumerated verdict lines). This sprint's report states 18 and enumerates 18. The
  arithmetic that would hide a genuinely missed scenario was right this time.

**Could improve**

- **R5 — VRTX3-S-0044's requirements never reached the spec of record, and this sprint is on the
  same path.** This is the most consequential finding of the close and it is not about this sprint's
  code. Observed facts: `openspec/specs/health-probes/spec.md` holds 15 requirements, all of the form
  `Health probe A/B/C for variant …`, and zero occurrences of `588991239`, `369920394` or
  `1056287485`. `openspec/changes/vrtx3-s-0044-smoke-bugfix-sprint-smoke-b/` still sits un-archived
  alongside this sprint's change, while `openspec/changes/archive/` holds five changes — every one of
  them an idea-keyed enhancement change (`vrtx3-i-0047` … `-0051`). VRTX3-S-0044's land commit
  `77ec28f` is on `origin/dev`, so the sprint did land. So VRTX3-S-0044's release notes claim "This
  release is the first to write any `/api/healthz-smoke-bugfix*` endpoint into the spec of record" —
  and as of this close, that has not happened. The obvious hypothesis is that the archive/merge step
  keys off the idea-derived change-id shape and does not match the sprint-keyed
  `vrtx3-s-00NN-smoke-bugfix-sprint-smoke-b` id that BUGFIX sprints are handed; **that is a
  hypothesis, not a verified cause** — the archiving mechanism was not inspected, and this ticket is
  forbidden from touching anything under `openspec/`, so nothing was changed to test it. Recorded as
  F1 below. The practical cost compounds: two sprints have now written six requirements and 36
  scenarios that no future sprint will inherit, and each subsequent bugfix sprint will keep choosing
  `ADDED` over `MODIFIED` — correctly, on the evidence available to it — because the requirements it
  should be modifying are not there to find.
- **R6 — Fix-note frontmatter is inconsistent across the three tickets.** VRTX3-T-0301 used the
  `artifact-conventions` identity block (`artifact` / `spec` / `status` / `author_role` / `sprint` /
  `ticket` / `branch` / `upstream` / `downstream`). VRTX3-T-0302 and VRTX3-T-0303 instead used a
  `name` / `description` / `metadata` shape — the memory-file frontmatter, not the artifact one. The
  prose in all three is good and the content is complete; what is missing on two of three is the
  machine-readable lineage, so `upstream`/`downstream` cannot be traversed and neither file declares
  its branch. Two of three getting it wrong the same way suggests the convention is not reaching the
  implementation dispatch, rather than three agents each slipping independently.
- **R7 — The `404` mis-transcription arrived for the thirty-second consecutive sprint**, on all three
  tickets. Every sprint pays the same live re-measurement to debunk the same wrong status code. D2
  above is the durable mitigation and it is now two sprints old; the fix still belongs upstream in
  defect capture.
- **R8 — The uneven-capture split recurred for the ninth time**, shape unchanged: VRTX3-T-0301 and
  VRTX3-T-0302 had no idea linked and asserted `404` unchecked, and VRTX3-T-0303's canvas
  (VRTX3-I-0054) root-caused the missing file correctly, noted the SPA-shell fallback in its own
  hypothesis — and still headlined `404`. The grounded half is not the safer half; it is the half
  that shows its work.
- **R9 — The ticket-description root-doc filter stripped the change-id line again**, exactly as
  VRTX3-S-0044's R8 recorded. Planning's first update to VRTX3-T-0301 and VRTX3-T-0302 silently
  dropped "read its `design.md` first", because that string contains the substring `design.md` — the
  OpenSpec change's technical-decisions document, not root `DESIGN.md`. Second consecutive sprint,
  same workaround ("the technical-decisions file under `openspec/changes/<id>/`"), no change in
  between. It is now reproducible rather than anecdotal, which is the threshold for fixing it:
  matching on path rather than filename would remove the workaround entirely.
- **R10 — Four containers, three dev-server ports** (planning `:5005`, VRTX3-T-0301 and -0302 both
  `:5004` in separate containers, QA `:5003`). Every agent read its own banner and none assumed, so
  nothing went wrong. Recorded because two containers landing on the same number is the case most
  likely to be mistaken for a sprint-level fact.

## Follow-ups carried out of this sprint

None is an open defect and none blocked the close — planning has no DEFECT-creation authority, so all
are left for a future sprint:

- **F1** — the archive/spec-merge gap in R5. Six requirements and 36 scenarios from two BUGFIX
  sprints are not in `openspec/specs/`, and `openspec/changes/vrtx3-s-0044-…` is still un-archived.
  Needs someone who can inspect the archiving step; this ticket may not write under `openspec/`.
- **F2** — the `healthz-smoke-bugfix*` subfamily is now 71 numbered variants. Six have been
  specified across two sprints, and by R5 none of those six is yet in the spec of record.
- **F3** — 47 tests in the probe family carry a wall-clock assertion. They are never rewritten by
  policy, so the ratio only improves by dilution as the family grows; a one-off sweep would retire
  the recurring copy-source hazard at its source.
- **F4** — the defect-capture gap behind R7 and R8: unlinked defect tickets carrying unverified
  status codes.

## Open defects

**None.** Integration QA found zero defects; `integration-defects-resolution.md` records an empty
table with `INTEGRATION_DEFECTS_RESOLUTION: COMPLETE`. This ticket's description carries no
"Conditionally approved" notice, so there are no known issues to carry past close.
