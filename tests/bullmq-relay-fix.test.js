// Regression guard for the bullmq relay exclusive time bound fix.
//
// bullmq 6.5.2 changed how relay exclusive time bounds are formatted so that
// large millisecond timestamps are not rounded when converted to Redis score
// bounds. The relay is experimental and is not used directly by this project,
// so the observable effect of the fix here is the resolved dependency version.
// Keep the backend on a release that contains it (>= 6.5.2).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lock = JSON.parse(
    readFileSync(
        new URL("../backend/package-lock.json", import.meta.url),
        "utf8"
    )
);

function versionParts(version) {
    return version.split(".").map((part) => Number.parseInt(part, 10));
}

function isAtLeast(version, minimum) {
    const actual = versionParts(version);
    const required = versionParts(minimum);

    for (let i = 0; i < required.length; i += 1) {
        if (actual[i] !== required[i]) {
            return actual[i] > required[i];
        }
    }

    return true;
}

test("backend resolves bullmq with the relay time bound precision fix", () => {
    const bullmq = lock.packages["node_modules/bullmq"];

    assert.ok(bullmq, "bullmq must be present in backend/package-lock.json");
    assert.ok(
        isAtLeast(bullmq.version, "6.5.2"),
        `expected bullmq >= 6.5.2, resolved ${bullmq.version}`
    );
    assert.equal(
        bullmq.resolved,
        `https://registry.npmjs.org/bullmq/-/bullmq-${bullmq.version}.tgz`,
        "resolved tarball must match the locked bullmq version"
    );
});
