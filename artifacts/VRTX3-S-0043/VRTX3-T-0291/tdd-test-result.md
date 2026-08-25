---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0043
ticket: VRTX3-T-0291
idea: VRTX3-I-0052
branch: vortex/fix/VRTX3-T-0291-smoke-bugfix-178769906754924-api-healthz-6ba9ec61
upstream:
  [artifacts/VRTX3-S-0043/VRTX3-T-0291/PLAN.md, artifacts/VRTX3-S-0043/VRTX3-T-0291/fix-note.md]
downstream: []
---

# TDD result — VRTX3-T-0291

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-bugfix3-827939824.test.ts`
(test file committed first, handler not yet created):

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix3-827939824.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix3-827939824.test.ts [ routes/api/healthz-smoke-bugfix3-827939824.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix3-827939824' imported from /workspace/repo/routes/api/healthz-smoke-bugfix3-827939824.test.ts

 Test Files  1 failed (1)
      Tests  no tests
error: "vitest" exited with code 1
```

## Green run

Handler added. Same command:

```
 RUN  v4.1.10 /workspace/repo

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate, `bun run verify` (lint + typecheck + full unit suite):

```
$ bun run lint && bun run typecheck && bun run test
...
 Test Files  141 passed (141)
      Tests  201 passed (201)
```

Exit code: 0.

## Live check (AC-4 / DoD-3)

Dev server (`bun run dev`, bound `:5001` per its own banner):

```
$ curl -s -o /tmp/body.txt -w '%{http_code} %{content_type}\n' http://localhost:5001/api/healthz-smoke-bugfix3-827939824
200 application/json;charset=UTF-8
{"ok":true,"variant":"827939824"}
```

## Build output check (AC-8 / DoD-6)

`bun run build` produced `.output/server/_routes/api/healthz_smoke_bugfix3_827939824.mjs`;
`find .output/server -iname "*.test.*"` returned nothing.

TDD-RESULT: 201 passed, 0 failed
