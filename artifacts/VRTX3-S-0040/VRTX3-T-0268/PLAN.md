# PLAN — VRTX3-T-0268 · Add GET /api/healthz-smoke-503463873-a

Change: `openspec/changes/vrtx3-i-0049-smoke-178767328680848-3-independent-endpoints-50/`
Requirement: **Health probe A for variant 503463873** (`specs/health-probes/spec.md`)
Read `design.md` first.

## Objective

Serve `GET /api/healthz-smoke-503463873-a` with the literal body
`{"ok": true, "variant": "503463873"}` as `application/json`, covered by a colocated unit test.

## Design reference

The idea VRTX3-I-0049 carries **no design blocks** (`a2a_get_idea_design` returned an empty
manifest), and this change adds no user-visible surface. There is nothing to export under
`artifacts/VRTX3-S-0040/design/` and no mockup to match.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to
   `routes/api/healthz-smoke-503463873-a.ts` and change the `variant` string to `"503463873"`.
   Nothing else changes. This copy source is pinned — see `design.md` § D2 for why no other
   neighbour in `routes/api/` is a valid template.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-503463873-a.test.ts`; update the import path, the `describe` title,
   the request URL and the expected body. Keep the single body assertion and add no timing case
   (`design.md` § D2).
3. Run the project's browser-free gate, then confirm the live response and the production route
   output. The status code alone cannot tell a wired route from a missing one — assert on the body
   and `Content-Type` (`design.md` § Context, measured).

## File/module ownership

Creates, and modifies nothing:

- `routes/api/healthz-smoke-503463873-a.ts`
- `routes/api/healthz-smoke-503463873-a.test.ts`

Owned elsewhere, do not touch: `routes/api/healthz-smoke-503463873-b.*` (VRTX3-T-0269),
`routes/api/healthz-smoke-503463873-c.*` (VRTX3-T-0270). Read-only:
`routes/api/healthz-smoke-528856326-a.ts` and its test, `vite.config.ts`, `vitest.config.ts`.
No dependency edge to either sibling ticket — the three ownership sets are disjoint.

## Definition of Done

AC-1 through AC-6 on the ticket. AC-1/AC-2 are the live-response behaviour, AC-3/AC-4 the module
and test shape, AC-5 the production build output, AC-6 the two-files-added, zero-modified property
that lets the three tickets merge in any order.
