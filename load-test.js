// ============================================================================
// URL Shortener — k6 Load Test
//
// Usage:
//   k6 run --vus 50  --duration 30s load-test.js   # Test A
//   k6 run --vus 100 --duration 60s load-test.js   # Test B
//   k6 run --vus 250 --duration 60s load-test.js   # Test C
//   k6 run --vus 500 --duration 60s load-test.js   # Test D
//   k6 run --vus 1000 --duration 60s load-test.js  # Test E
// ============================================================================

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const errorRate = new Rate("error_rate");
const redirectSuccess = new Rate("redirect_success");
const timeoutCount = new Counter("timeout_count");
const redirectDuration = new Trend("redirect_duration", true);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE_URL = "http://localhost";

// Replace with actual short codes from your database.
// Run: docker exec url-shortener-lb-postgres psql -U postgres -d urlshortener -c "SELECT short_code FROM urls LIMIT 20;"
const SHORT_CODES = [
  "loadtest1",
  "loadtest2",
  "loadtest3",
  "testcode1",
  "testcode2",
];

// ---------------------------------------------------------------------------
// Thresholds — test fails if these are exceeded
// ---------------------------------------------------------------------------
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<2000"],   // 95% of requests under 2s
    error_rate: ["rate<0.1"],            // Less than 10% errors
    redirect_success: ["rate>0.8"],      // At least 80% successful redirects
  },
  // Don't follow redirects — we want to measure the 302 response time,
  // not the time to fetch the destination page
  noConnectionReuse: false,
};

// ---------------------------------------------------------------------------
// Main test function — runs once per VU per iteration
// ---------------------------------------------------------------------------
export default function () {
  // Pick a random short code
  const code = SHORT_CODES[Math.floor(Math.random() * SHORT_CODES.length)];

  const res = http.get(`${BASE_URL}/${code}`, {
    redirects: 0,           // Don't follow the 302
    timeout: "10s",
    tags: { name: "redirect" },
  });

  // Track custom metrics
  redirectDuration.add(res.timings.duration);

  // A successful redirect is a 301 or 302
  const isRedirect = res.status === 301 || res.status === 302;
  // 404 = code not found, also a valid "nginx worked" response
  const isNotFound = res.status === 404;
  const isServerError = res.status >= 500;
  const isTimeout = res.status === 0;

  redirectSuccess.add(isRedirect);
  errorRate.add(isServerError || isTimeout);

  if (isTimeout) {
    timeoutCount.add(1);
  }

  check(res, {
    "status is 301/302 (redirect)": () => isRedirect,
    "status is not 5xx": () => !isServerError,
    "response time < 1s": () => res.timings.duration < 1000,
    "has Location header": () => isRedirect && res.headers["Location"] !== undefined,
  });

  // Small think-time to simulate real users (remove for max-throughput test)
  sleep(0.1);
}

// ---------------------------------------------------------------------------
// Summary reporter
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  const med = data.metrics.http_req_duration?.values?.med?.toFixed(2) || "N/A";
  const p95 = data.metrics.http_req_duration?.values["p(95)"]?.toFixed(2) || "N/A";
  const p99 = data.metrics.http_req_duration?.values["p(99)"]?.toFixed(2) || "N/A";
  const avg = data.metrics.http_req_duration?.values?.avg?.toFixed(2) || "N/A";
  const max = data.metrics.http_req_duration?.values?.max?.toFixed(2) || "N/A";
  const reqs = data.metrics.http_reqs?.values?.count || 0;
  const rps = data.metrics.http_reqs?.values?.rate?.toFixed(2) || "N/A";
  const errors = data.metrics.error_rate?.values?.rate?.toFixed(4) || "0";
  const timeouts = data.metrics.timeout_count?.values?.count || 0;

  console.log("\n========================================");
  console.log("  URL SHORTENER LOAD TEST RESULTS");
  console.log("========================================");
  console.log(`  Total Requests : ${reqs}`);
  console.log(`  Requests/sec   : ${rps}`);
  console.log(`  Avg Latency    : ${avg} ms`);
  console.log(`  p50 Latency    : ${med} ms`);
  console.log(`  p95 Latency    : ${p95} ms`);
  console.log(`  p99 Latency    : ${p99} ms`);
  console.log(`  Max Latency    : ${max} ms`);
  console.log(`  Error Rate     : ${(parseFloat(errors) * 100).toFixed(2)}%`);
  console.log(`  Timeouts       : ${timeouts}`);
  console.log("========================================\n");

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
