// ============================================================================
// Dependency version guard for security (CVE) bumps.
//
// Verifies the committed manifests / lockfiles pin the fixed versions:
//   - zod        4.6.6  (GHSA-mrhx-c7xc-m3w5) in frontend
//   - body-parser 2.4.0 (GHSA-27r3-jxmh-p828) in backend
//
// The test runs with plain Node (no external deps) against the committed files,
// so it can run in CI even before `npm install`.
//
// Usage: node tests/dependency-versions.js
// ============================================================================

import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const frontendPkgPath = path.join(repoRoot, "frontend", "package.json");
const frontendLockPath = path.join(repoRoot, "frontend", "package-lock.json");
const backendLockPath = path.join(repoRoot, "backend", "package-lock.json");

// Compare "x.y.z" version strings numerically. Returns -1, 0, or 1.
function compareVersions(a, b) {
  const pa = String(a).split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = String(b).split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

// Strip a leading caret/tilde and return the version portion.
function rangeVersion(range) {
  return String(range).replace(/^[\^~]/, "");
}

const failures = [];
let checks = 0;

function check(name, ok, detail) {
  checks += 1;
  if (!ok) failures.push(`${name}: ${detail}`);
  console.log(`${ok ? "✅ PASS" : "❌ FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
}

const frontendPkg = JSON.parse(await readFile(frontendPkgPath, "utf8"));
const frontendLock = JSON.parse(await readFile(frontendLockPath, "utf8"));
const backendLock = JSON.parse(await readFile(backendLockPath, "utf8"));

// --- zod (frontend) ---------------------------------------------------------
const zodRange = frontendPkg.dependencies?.zod;
check(
  "frontend/package.json declares zod >= 4.6.6",
  typeof zodRange === "string" && compareVersions(rangeVersion(zodRange), "4.6.6") >= 0,
  `zod=${zodRange}`,
);

const zodResolved = frontendLock.packages?.["node_modules/zod"]?.version;
check(
  "frontend lockfile resolves zod to 4.6.6",
  zodResolved === "4.6.6",
  `resolved=${zodResolved}`,
);

const zodRootLocked = frontendLock.packages?.[""]?.dependencies?.zod;
check(
  "frontend lockfile root zod range >= 4.6.6",
  typeof zodRootLocked === "string" &&
    compareVersions(rangeVersion(zodRootLocked), "4.6.6") >= 0,
  `root zod=${zodRootLocked}`,
);

// --- body-parser (backend, transitive via express) --------------------------
const bodyParserResolved = backendLock.packages?.["node_modules/body-parser"]?.version;
check(
  "backend lockfile resolves body-parser to 2.4.0",
  bodyParserResolved === "2.4.0",
  `resolved=${bodyParserResolved}`,
);

console.log(`\n${checks} checks, ${failures.length} failure(s).`);
if (failures.length > 0) {
  console.error("\nFailures:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
