## 1. Probe A — /api/healthz-smoke-992401223-a

- [ ] 1.1 Add `routes/api/healthz-smoke-992401223-a.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0252)
- [ ] 1.2 Add `routes/api/healthz-smoke-992401223-a.test.ts` asserting the handler returns `{ ok: true, variant: "992401223" }`, with no wall-clock timing case (VRTX3-T-0252)
- [ ] 1.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0252)

## 2. Probe B — /api/healthz-smoke-992401223-b

- [x] 2.1 Add `routes/api/healthz-smoke-992401223-b.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0253)
- [x] 2.2 Add `routes/api/healthz-smoke-992401223-b.test.ts` asserting the handler returns `{ ok: true, variant: "992401223" }`, with no wall-clock timing case (VRTX3-T-0253)
- [x] 2.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0253)

## 3. Probe C — /api/healthz-smoke-992401223-c

- [x] 3.1 Add `routes/api/healthz-smoke-992401223-c.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0254)
- [x] 3.2 Add `routes/api/healthz-smoke-992401223-c.test.ts` asserting the handler returns `{ ok: true, variant: "992401223" }`, with no wall-clock timing case (VRTX3-T-0254)
- [x] 3.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0254)
