## 1. Probe A — /api/healthz-smoke-503463873-a

- [x] 1.1 Add `routes/api/healthz-smoke-503463873-a.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0268)
- [x] 1.2 Add `routes/api/healthz-smoke-503463873-a.test.ts` asserting the handler returns `{ ok: true, variant: "503463873" }`, with no wall-clock timing case (VRTX3-T-0268)
- [x] 1.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0268)

## 2. Probe B — /api/healthz-smoke-503463873-b

- [ ] 2.1 Add `routes/api/healthz-smoke-503463873-b.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0269)
- [ ] 2.2 Add `routes/api/healthz-smoke-503463873-b.test.ts` asserting the handler returns `{ ok: true, variant: "503463873" }`, with no wall-clock timing case (VRTX3-T-0269)
- [ ] 2.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0269)

## 3. Probe C — /api/healthz-smoke-503463873-c

- [ ] 3.1 Add `routes/api/healthz-smoke-503463873-c.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0270)
- [ ] 3.2 Add `routes/api/healthz-smoke-503463873-c.test.ts` asserting the handler returns `{ ok: true, variant: "503463873" }`, with no wall-clock timing case (VRTX3-T-0270)
- [ ] 3.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0270)
