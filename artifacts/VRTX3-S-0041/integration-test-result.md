---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0041
idea: VRTX3-I-0050
branch: vortex/sprint/vrtx3-s-0041-9e5df666
downstream: [artifacts/VRTX3-S-0041/qa-test-report.md]
---

# Integration test result — VRTX3-S-0041

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed the single `chromium` project covers all 6 specs
$ bunx playwright test --project=chromium
```

`bunx playwright test --list` returned `Total: 6 tests in 2 files` under one `[chromium]` project
(`e2e/home.spec.ts`, `e2e/smoke.spec.ts`) — no mobile/emulated project exists in
`playwright.config.ts`, so `--project=chromium` alone covers every spec.

An initial run timed out waiting on `config.webServer` (120s) — Vite's dependency
re-optimization (triggered by a stray `bun run dev` process I had started manually on port 5000
for the live-response check, run in the same session) ran long enough to blow the 120s ceiling on
its first cold pass. Killed the stray dev-server process and re-ran; the retry completed cleanly
in 4.2s with dependencies already warm. This is container/session contention from my own prior
manual step, not a defect in the sprint's code — noted for traceability, not logged as a DEFECT.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 406ms |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 403ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 577ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 578ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 326ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 350ms |

Playwright summary: `6 passed (4.2s)`

None of these specs exercise the new `healthz-smoke-865643533-*` probes directly — per
`design.md` § Test-harness phase, the family adds no browser-observable behaviour, so probe
coverage is the unit tier plus the live HTTP verification recorded in `qa-test-report.md`. This
run proves the existing E2E suite has no regression from the sprint's changes.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
