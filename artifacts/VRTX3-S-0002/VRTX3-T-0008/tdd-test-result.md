---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0002
ticket: VRTX3-T-0008
branch: vortex/fix/VRTX3-T-0008-smoke-bugfix-17873246012078034-api-healt-205c5ea0
upstream: [artifacts/VRTX3-S-0002/VRTX3-T-0008/PLAN.md]
---

# TDD result — VRTX3-T-0008

## Test cases

| Test                                                                                               | Covers | Intent                       |
| -------------------------------------------------------------------------------------------------- | ------ | ---------------------------- |
| `routes/api/healthz-smoke-bugfix2-142310404.test.ts › returns HTTP 200 with correct response body` | AC-4   | handler returns correct body |

## Red run

The handler file did not exist before the fix — confirmed:

```
$ ls -la /workspace/repo/routes/api/healthz-smoke-bugfix2-142310404.ts
ls: cannot access '/workspace/repo/routes/api/healthz-smoke-bugfix2-142310404.ts': No such file or directory
```

A live request to the endpoint returned `200 text/html` (the SPA shell) instead of the expected `200 application/json` with probe body.

## Green run

`bun run verify` _(this stack's full gate — lint, typecheck, all tests)_

```
$ bun run verify > /tmp/verify.log 2>&1; echo "EXIT:$?"; tail -10 /tmp/verify.log

EXIT:0
 Test Files  108 passed (108)
      Tests  168 passed (168)
   Start at  15:18:16
   Duration  28.83s (transform 10.94s, setup 3.43s, import 22.81s, tests 6.93s, environment 10.75s)
```

Live verification: `GET /api/healthz-smoke-bugfix2-142310404` returned `200 application/json` with body `{"ok":true,"variant":"142310404"}`. Control route `/api/healthz-smoke-528856326-a` confirmed measurement harness was live.

TDD-RESULT: 168 passed, 0 failed
