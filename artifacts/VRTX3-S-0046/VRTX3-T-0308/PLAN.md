# PLAN — VRTX3-T-0308

`/api/healthz-smoke-bugfix2-101945976` returns the SPA shell, should return `ok` + `variant`.

Change: `vrtx3-s-0046-smoke-bugfix-sprint-smoke-b`
Requirement: **Health probe for bugfix variant 101945976** (`specs/health-probes/spec.md`)

## Objective

Serve `GET /api/healthz-smoke-bugfix2-101945976` with `200 application/json` and the body
`{"ok":true,"variant":"101945976"}`, plus a colocated regression test.

**Root cause:** the handler file was never created. Nitro builds its route table from the
filesystem, so the path is unregistered and the request falls through to the SPA `index.html`
shell. Measured during planning at `200 text/html` (949 bytes), not the `404` the report claims —
the defect is real, the status code in the report is not. This ticket has no idea canvas behind it,
so the `404` was never checked upstream; see `design.md` § D1. Nothing existing is broken; the fix
is purely additive.

## Steps

1. Create `routes/api/healthz-smoke-bugfix2-101945976.ts` from the pinned template in `design.md`
   § D2, with `variant: "101945976"` — the numeric segment only, no `bugfix2-` prefix
   (`design.md` § D3). Copy `healthz-smoke-528856326-a.ts`, not a neighbouring `bugfix2-*` file.
2. Create `routes/api/healthz-smoke-bugfix2-101945976.test.ts` from the same section's test
   template, with the bugfix-subfamily regression header and a single body assertion. No wall-clock
   timing case (`design.md` § D2, closing paragraph).
3. Run the unit tier. The route test runs under the node-environment `server` vitest project.
4. Verify live, on the port your own Vite banner names. Assert body and `Content-Type`, never the
   status code — an unrouted `/api/*` path also answers `200` (`design.md` § D1). The unit test
   imports the handler module directly, so it passes even if Nitro never registered the path; only
   this live request proves the route is wired.
5. Run the repo's core verification gate before committing.

## File / module ownership

| File                                                 | Action |
| ---------------------------------------------------- | ------ |
| `routes/api/healthz-smoke-bugfix2-101945976.ts`      | create |
| `routes/api/healthz-smoke-bugfix2-101945976.test.ts` | create |

Nothing else. No existing file is modified, and no shared helper, factory, constants module or
barrel export is introduced (`design.md` § D4). Ownership is disjoint from VRTX3-T-0307 and
VRTX3-T-0309, so this ticket carries no `depends_on` and may merge in any order.

## Definition of Done

AC-1 through AC-6 on the ticket are met, and the fixed interface contract in `design.md` § D3 holds
verbatim.
