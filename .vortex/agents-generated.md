# Agent-recorded corrections to AGENTS.md

`AGENTS.md` is human-authored and is never rewritten by an agent. Corrections found while working
the repository are recorded here instead.

## § Health Probe Routes — the probe-family count is stale

`AGENTS.md` opens that section with "a family of 124 near-identical GET probes" and later refers to
"47 of the 124 probe tests" and a ratio of "47 of 124".

Counted from the filesystem on `vortex/sprint/vrtx3-s-0042-8239c37c` at `e281ced`, during
VRTX3-S-0042 planning:

- 130 `healthz-smoke-*` handlers and 130 colocated tests under `routes/api/`
- 47 of those 130 tests carry `expect(elapsed).toBeLessThan(100)`
- `routes/api/` holds 263 entries / 266 `.ts` files in total

So the ratio is **47 of 130**, not 47 of 124. The figure was accurate when written and drifted
because VRTX3-S-0040 and VRTX3-S-0041 each added three probe families without updating it — which
is the intended behaviour, not an oversight: `ARCHITECTURE.md` § Key Decisions records "Root docs
carry no per-sprint counts", and `AGENTS.md` is out of an agent's write scope in any case.

**Nothing about the guidance changes.** The 47 legacy tests are never rewritten, so the numerator is
fixed and only the denominator grows. The instruction that matters — copy the pinned
`healthz-smoke-528856326-a` pair, check which file an idea names, drop any timing case — is
unaffected by the count. If the section is ever revised by hand, the durable phrasing is "47 legacy
tests out of a family that grows every sprint" rather than a pair of numbers that needs maintaining.

Recorded by the planning agent, VRTX3-S-0042 (change
`vrtx3-i-0051-smoke-178768361938065-3-independent-endpoints-61`).
