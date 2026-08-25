# PLAN — VRTX3-T-0278 · Add GET /api/healthz-smoke-865643533-c

Change: `openspec/changes/vrtx3-i-0050-smoke-178767736117797-3-independent-endpoints-86/`
Requirement: **Health probe C for variant 865643533** (`specs/health-probes/spec.md`)
Read `design.md` first.

## Objective

Serve `GET /api/healthz-smoke-865643533-c` with the literal body
`{"ok": true, "variant": "865643533"}` as `application/json`, covered by a colocated unit test.

## Design reference

The idea VRTX3-I-0050 carries **no design blocks** (`a2a_get_idea_design` returned an empty
manifest), and this change adds no user-visible surface. There is nothing to export under
`artifacts/VRTX3-S-0041/design/` and no mockup to match.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to
   `routes/api/healthz-smoke-865643533-c.ts` and change the `variant` string to `"865643533"`.
   Nothing else changes. This copy source is pinned — see `design.md` § D2 for why no other
   neighbour in `routes/api/` is a valid template, including the one the idea names.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-865643533-c.test.ts`; update the import path, the `describe` title,
   the request URL and the expected body. Keep the single body assertion and add no timing case
   (`design.md` § D2).
3. Run the project's browser-free gate, then confirm the live response and the production route
   output. The status code alone cannot tell a wired route from a missing one — assert on the body
   and `Content-Type` (`design.md` § Context, measured). Read the dev-server port from the Vite
   banner rather than assuming one.

## File/module ownership

Creates, and modifies nothing:

- `routes/api/healthz-smoke-865643533-c.ts`
- `routes/api/healthz-smoke-865643533-c.test.ts`

Owned elsewhere, do not touch: `routes/api/healthz-smoke-865643533-a.*` (VRTX3-T-0276), `routes/api/healthz-smoke-865643533-b.*` (VRTX3-T-0277). Read-only:
`routes/api/healthz-smoke-528856326-a.ts` and its test, `vite.config.ts`, `vitest.config.ts`.
No dependency edge to either sibling ticket — the three ownership sets are disjoint.

## Definition of Done

AC-1 through AC-6 on the ticket. AC-1/AC-2 are the live-response behaviour, AC-3/AC-4 the module
and test shape, AC-5 the production build output, AC-6 the two-files-added, zero-modified property
that lets the three tickets merge in any order.
