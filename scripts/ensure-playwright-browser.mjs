// Fail fast — with an actionable message — when Playwright's Chromium isn't
// usable, instead of letting `playwright test` stall silently. In a browserless
// environment (e.g. an agent workspace container) the runner can hang
// indefinitely with no output after "$ playwright test": the webServer starts,
// then globalSetup's chromium.launch() never surfaces its error. That silent
// stall was measured costing an agent ~15 minutes of retries; this preflight
// turns it into a 1-second explicit failure.
//
// The far more common failure is a VERSION MISMATCH rather than a missing
// browser: the Vortex QA container bakes one Chromium build, and Playwright
// only accepts the build matching its own minor. When this repo pinned ~1.50.0
// against a 1.60.0 image, the baked chromium-1223 could not satisfy a runner
// looking for chromium-1155 — so this guard fired correctly, but its old
// remediation text said "install it: bun x playwright install chromium" and a
// QA agent spent 16 of its 18 minutes obeying that. In an agent container that
// command is a trap: it prints NOTHING, hangs until killed, and cannot succeed
// anyway because PLAYWRIGHT_BROWSERS_PATH is root-owned and the runtime user is
// unprivileged. So this guard now diagnoses the mismatch by name and never
// suggests installing inside a container.
//
// Wired as `pretest:e2e`/`pree2e`/`pretest:smoke`, so every E2E entrypoint
// (and `verify:full`) gets the guard automatically.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);

/** The Playwright baked into the Vortex QA image; unset outside a Vortex agent container. */
const bakedVersion = process.env.VORTEX_PLAYWRIGHT_VERSION;
const inAgentContainer = Boolean(bakedVersion);

const runnerVersion = require("@playwright/test/package.json").version;
const minor = (v) => v.split(".").slice(0, 2).join(".");

const fail = (lines) => {
  console.error(["[test:e2e] " + lines[0], "", ...lines.slice(1)].join("\n"));
  process.exit(1);
};

// 1. Version mismatch — check FIRST: it explains a missing executable, and the
//    fix (re-pin) is different from the fix for a genuinely absent browser.
if (inAgentContainer && minor(runnerVersion) !== minor(bakedVersion)) {
  fail([
    `Playwright version mismatch — E2E cannot run in this container.`,
    `  this project resolves @playwright/test : ${runnerVersion}`,
    `  this container has Chromium baked for  : ${bakedVersion}`,
    "",
    "Playwright only launches the Chromium build matching its own minor, and the",
    "baked browser is the only one available here.",
    "",
    "Fix: re-pin @playwright/test to " + `~${minor(bakedVersion)}.0` + " in package.json,",
    "then `bun install`. Keep it equal to PLAYWRIGHT_VERSION in Dockerfile.awc.playwright.",
    "",
    "Do NOT run `playwright install` in this container. It emits no output, hangs",
    "until killed, and cannot succeed — the browser directory is root-owned and this",
    "process is unprivileged. If you cannot re-pin, report E2E as blocked and verify",
    "via integration tests instead.",
  ]);
}

// 2. Browser genuinely absent.
const executable = chromium.executablePath();
if (!existsSync(executable)) {
  if (inAgentContainer) {
    fail([
      `Playwright's Chromium is missing at ${executable}.`,
      `@playwright/test ${runnerVersion} matches the image's baked ${bakedVersion}, so this is`,
      "an image defect, not something to fix from inside the container.",
      "",
      "Do NOT run `playwright install` here — it hangs silently and cannot write to the",
      "browser directory. Report E2E as blocked (environment) and verify via integration tests.",
    ]);
  }
  fail([
    `Playwright's Chromium browser is not installed (expected at: ${executable}).`,
    "E2E tests need a real browser. Either:",
    "  - install it:  bun x playwright install chromium",
    "  - or skip E2E here — in the agent workflow, E2E runs in the QA phase",
    "    (browser-equipped container) and in CI, not in engineer containers.",
    "    Use `bun run verify` (lint + typecheck + test) instead.",
  ]);
}
