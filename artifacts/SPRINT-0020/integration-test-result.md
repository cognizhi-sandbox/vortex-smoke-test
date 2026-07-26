# Integration Test Results — SPRINT-0020

## E2E Test Execution

**Test Command:**

```bash
bun run e2e -- --project=chromium
```

**Playwright Run Summary:**

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (1.7s)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (501ms)
  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (2.7s)
  ✓  2 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (3.0s)
  ✓  4 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (3.0s)

  5 passed (7.5s)
```

## Test Specifications

| Spec File         | Test Name                                                 | Status | Duration |
| ----------------- | --------------------------------------------------------- | ------ | -------- |
| e2e/home.spec.ts  | shows the hero content and desktop nav                    | ✓ PASS | 1.7s     |
| e2e/home.spec.ts  | has no vertical scrollbar on common viewport sizes        | ✓ PASS | 3.0s     |
| e2e/home.spec.ts  | opens and closes the mobile nav from the hamburger button | ✓ PASS | 3.0s     |
| e2e/smoke.spec.ts | home page loads with no console errors                    | ✓ PASS | 2.7s     |
| e2e/smoke.spec.ts | the API responds                                          | ✓ PASS | 501ms    |

## Endpoint-Specific Verification

The three newly fixed endpoints were manually verified during development to confirm correct behavior:

**VRTX-0090 — /api/healthz-smoke-bugfix-248794935**

```bash
$ curl http://localhost:5000/api/healthz-smoke-bugfix-248794935
{"ok":true,"variant":"248794935"}
```

✓ Returns 200 with expected variant

**VRTX-0091 — /api/healthz-smoke-bugfix2-601069474**

```bash
$ curl http://localhost:5000/api/healthz-smoke-bugfix2-601069474
{"ok":true,"variant":"601069474"}
```

✓ Returns 200 with expected variant

**VRTX-0092 — /api/healthz-smoke-bugfix3-458270372**

```bash
$ curl http://localhost:5000/api/healthz-smoke-bugfix3-458270372
{"ok":true,"variant":"458270372"}
```

✓ Returns 200 with expected variant

---

**E2E-RESULT: chromium 5 passed, 0 failed**
