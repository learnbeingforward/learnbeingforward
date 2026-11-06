/**
 * Runs automatically as part of every production build (see the "build"
 * script in package.json) — every step listed here executes on EVERY single
 * deploy, not just once. That means every script added here must be safe to
 * re-run repeatedly against a database that may already have its changes
 * applied (check-before-create / upsert, never blind inserts) and must not
 * depend on anything that only exists on the author's own machine (no
 * hardcoded local drive paths) — Hostinger's build host only has what's
 * actually committed to this repo.
 *
 * This exists so that schema and content changes made in the editor reach
 * production automatically on the next push, without a manual .env-swap
 * step. Add new idempotent setup scripts to the list below as they're
 * written; remove a script from this list once its one-time purpose is
 * fully superseded (e.g. replaced by a later script) so it doesn't keep
 * re-running forever for no reason.
 */
import { execSync } from "node:child_process";

const STEPS = [
  "scripts/add-main-book-modules.ts",
  "scripts/generate-submodule-content.ts",
  "scripts/update-team-experience.ts",
];

for (const step of STEPS) {
  console.log(`\n=== deploy-setup: ${step} ===`);
  try {
    execSync(`tsx ${step}`, { stdio: "inherit" });
  } catch (err) {
    console.error(`deploy-setup: "${step}" failed — continuing with the rest, but check this.`);
    console.error(err);
  }
}

console.log("\n=== deploy-setup: done ===");
