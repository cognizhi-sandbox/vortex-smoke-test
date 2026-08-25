## 1. Probe A — /api/healthz-smoke-865643533-a

- [x] 1.1 Add `routes/api/healthz-smoke-865643533-a.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0276)
- [x] 1.2 Add `routes/api/healthz-smoke-865643533-a.test.ts` asserting the handler returns `{ ok: true, variant: "865643533" }`, with no wall-clock timing case (VRTX3-T-0276)
- [x] 1.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0276)

## 2. Probe B — /api/healthz-smoke-865643533-b

- [x] 2.1 Add `routes/api/healthz-smoke-865643533-b.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0277)
- [x] 2.2 Add `routes/api/healthz-smoke-865643533-b.test.ts` asserting the handler returns `{ ok: true, variant: "865643533" }`, with no wall-clock timing case (VRTX3-T-0277)
- [x] 2.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0277)

## 3. Probe C — /api/healthz-smoke-865643533-c

- [ ] 3.1 Add `routes/api/healthz-smoke-865643533-c.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0278)
- [ ] 3.2 Add `routes/api/healthz-smoke-865643533-c.test.ts` asserting the handler returns `{ ok: true, variant: "865643533" }`, with no wall-clock timing case (VRTX3-T-0278)
- [ ] 3.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0278)
