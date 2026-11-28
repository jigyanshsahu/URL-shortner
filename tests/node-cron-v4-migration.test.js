// Regression guard for the node-cron v4 migration.
//
// node-cron v4 turned the scheduled job into a `ScheduledTask`: `createTask`
// returns a task that is not started until `start()` is called, the v3
// `scheduled`/`runOnInit` options are gone, and `cron.task` was renamed to
// `cron.createTask`. The expired-URL cleanup job must be registered with that
// v4 task API instead of the legacy `cron.schedule` call site.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const serverSource = readFileSync(
    new URL("../backend/src/server.js", import.meta.url),
    "utf8"
);

test("expired URL cleanup is registered with the node-cron v4 task API", () => {
    assert.match(
        serverSource,
        /import\s*\{\s*createTask\s*\}\s*from\s*["']node-cron["']/,
        "server.js must import the node-cron v4 createTask function"
    );
    assert.match(
        serverSource,
        /\bcreateTask\(\s*["']\* \* \* \* \*["']/,
        "the cleanup job must be created with createTask on a 5-field cron expression"
    );
    assert.match(
        serverSource,
        /await cleanupExpiredUrls\(\)/,
        "the cleanup job must await cleanupExpiredUrls"
    );
    assert.match(
        serverSource,
        /\.start\(\)/,
        "a task returned by createTask must be started explicitly in v4"
    );
    assert.doesNotMatch(
        serverSource,
        /cron\.schedule\(/,
        "the cleanup job must not use the legacy cron.schedule call site"
    );
});

test("cleanup task does not use node-cron APIs removed in v4", () => {
    const removedApis = ["scheduled:", "runOnInit", "onComplete", "task.now(", "cron.task("];

    for (const removedApi of removedApis) {
        assert.ok(
            !serverSource.includes(removedApi),
            `server.js must not use the node-cron API removed in v4: ${removedApi}`
        );
    }
});
