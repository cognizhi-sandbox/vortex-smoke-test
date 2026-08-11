---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0020
idea: VRTX3-I-0029
branch: vortex/sprint/vrtx3-s-0020-19823fbf
downstream: [artifacts/VRTX3-S-0020/qa-test-report.md]
---

# Integration test result — VRTX3-S-0020

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                                            | Result | Notes |
| ----------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14:3` › Home page › shows the hero content and desktop nav                    | pass   | 386ms |
| `e2e/smoke.spec.ts:13:1` › home page loads with no console errors                               | pass   | 468ms |
| `e2e/home.spec.ts:27:3` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 600ms |
| `e2e/home.spec.ts:44:3` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 652ms |
| `e2e/smoke.spec.ts:26:1` › the API responds                                                     | pass   | 320ms |

Playwright summary: `5 passed (3.6s)`

Full raw output:

```
Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (386ms)
  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (468ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (600ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (652ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (320ms)

  5 passed (3.6s)
```

Note: neither `e2e/home.spec.ts` nor `e2e/smoke.spec.ts` exercises the `healthz-smoke-*` probe
family (per `SPRINT-PLAN.md` §6, `e2e/smoke.spec.ts:27` probes `/api/hello` only) — this sprint's
three acceptance criteria were verified directly against a live dev server instead; see
`qa-test-report.md` § E2E Test Status and § Issues Found for that evidence.

E2E-RESULT: chromium 5 passed, 0 failed
