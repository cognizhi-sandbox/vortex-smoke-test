# PLAN — VRTX3-T-0318: /api/healthz-smoke-436511294-c

Change: `vrtx3-i-0057-smoke-178782657090712-3-ind`
Requirement: **Health probe C for variant 436511294**

## Objective

Serve `GET /api/healthz-smoke-436511294-c` with `200 application/json` and the literal body
`{"ok": true, "variant": "436511294"}`, from one new handler file plus its colocated Vitest test.
The path returns the SPA shell today — see the change's `design.md` § Measured context.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to `routes/api/healthz-smoke-436511294-c.ts` and
   change only the variant string. Use the pinned pair, not a sampled neighbour, and add no timing
   assertion — `design.md` § D2 explains why, including how the two files the idea cites check out.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-436511294-c.test.ts`; change the import path, the identifier, the
   `describe` title, the request URL and the expected variant. One `it` block, one body assertion.
   The exact module shape both files must have is fixed in `design.md` § D3.
3. Verify the route is actually wired, not just unit-tested: a route test imports the handler
   directly and passes even if Nitro never registered the path. Assert on the response body and
   `Content-Type` against a live server — an unrouted `/api/*` answers `200 text/html`, so the
   status code proves nothing (`design.md` § D3, § Measured context). Read the dev server's port
   from the Vite banner rather than assuming one.
4. Confirm the route module appears in the production build output at
   `.output/server/_routes/api/healthz_smoke_436511294_c.mjs` (`design.md` § D5).
5. Run the repository's browser-free gate before committing. No harness or CI change is needed —
   `design.md` § D5 and § D6.

## File/module ownership

Creates, and touches nothing else:

- `routes/api/healthz-smoke-436511294-c.ts`
- `routes/api/healthz-smoke-436511294-c.test.ts`

Read-only: `routes/api/healthz-smoke-528856326-a.ts`, `routes/api/healthz-smoke-528856326-a.test.ts`,
`vite.config.ts`, `vitest.config.ts`.

No overlap with VRTX3-T-0316 or VRTX3-T-0317, so there is no dependency edge between the three.

## Definition of Done

AC-1 through AC-5 on the ticket are met. AC-1 and AC-2 are the live-response checks from step 3,
AC-3 is the module shape from step 1, AC-4 is the test from step 2, and AC-5 is the build-output
check from step 4.

## Design reference

The idea carries no design blocks — `a2a_get_idea_design(VRTX3-I-0057)` returns an empty manifest.
There is no UI in this change, so nothing was exported to `artifacts/VRTX3-S-0047/design/`.
