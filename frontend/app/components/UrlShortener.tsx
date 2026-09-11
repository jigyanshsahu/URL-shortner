"use client";

import { useState, useRef, useEffect } from "react";
import { createShortUrl, isValidUrl, CreateUrlResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";

interface UrlShortenerProps {
  onUrlCreated?: () => void;
  onOpenQr?: (shortCode: string, id: string | number) => void;
  onOpenAnalytics?: (shortCode: string, id: string | number) => void;
}

export default function UrlShortener({
  onUrlCreated,
  onOpenQr,
  onOpenAnalytics,
}: UrlShortenerProps) {
  const { token, isAuthenticated, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<"quick" | "custom" | "expiry">("quick");
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryOption, setExpiryOption] = useState<"never" | "1h" | "24h" | "7d" | "30d">("never");
  const [customExpiry, setCustomExpiry] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateUrlResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultCardRef.current) {
      gsap.fromTo(
        resultCardRef.current,
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" }
      );
    }
  }, [result]);

  const calculateExpiresAt = (): string | undefined => {
    if (customExpiry) return new Date(customExpiry).toISOString();
    const now = Date.now();
    switch (expiryOption) {
      case "1h":
        return new Date(now + 3600 * 1000).toISOString();
      case "24h":
        return new Date(now + 24 * 3600 * 1000).toISOString();
      case "7d":
        return new Date(now + 7 * 24 * 3600 * 1000).toISOString();
      case "30d":
        return new Date(now + 30 * 24 * 3600 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const handleShorten = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste a destination link to shorten.");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL (e.g., example.com or https://company.org).");
      return;
    }

    if (alias.trim()) {
      const aliasRegex = /^[a-zA-Z0-9_-]+$/;
      if (!aliasRegex.test(alias.trim())) {
        setError("Alias can only contain letters, numbers, hyphens, and underscores.");
        return;
      }
      if (alias.trim().length < 3 || alias.trim().length > 30) {
        setError("Custom alias must be between 3 and 30 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      const expiresAt = calculateExpiresAt();
      const res = await createShortUrl(trimmed, {
        alias: alias.trim() || undefined,
        expiresAt,
        token,
      });

      setResult(res);
      if (onUrlCreated) {
        onUrlCreated();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to shorten link.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.shortUrl) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleReset = () => {
    setResult(null);
    setUrl("");
    setAlias("");
    setExpiryOption("never");
    setCustomExpiry("");
    setError(null);
  };

  return (
    <div
      id="shortener"
      ref={containerRef}
      className="relative w-full rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
    >
      {/* Top Banner & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-5">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Enterprise URL Shortener</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </h3>
          <p className="text-xs text-zinc-400">
            Powered by Redis cache & BullMQ background queue for high concurrency
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "quick"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Quick Shorten
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "custom"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Custom Alias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expiry")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "expiry"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Expiration
          </button>
        </div>
      </div>

      {/* Form Body */}
      {!result ? (
        <form onSubmit={handleShorten} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-medium text-red-400">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Primary URL Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long destination URL here (e.g. https://longdomain.com/path...)"
              className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
            />
          </div>

          {/* Tab 2: Custom Alias */}
          {activeTab === "custom" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Custom Link Vanity Alias
              </label>
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <span className="flex items-center bg-zinc-800/80 px-3 text-xs text-zinc-400 font-mono border-r border-zinc-700/60">
                  shortly.app/
                </span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom-brand-name"
                  className="w-full bg-transparent px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder-zinc-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                Letters, numbers, dashes, and underscores only. Length: 3-30 characters.
              </p>
            </div>
          )}

          {/* Tab 3: Expiration Controls */}
          {activeTab === "expiry" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
              <label className="text-xs font-semibold text-zinc-300">
                Link Expiration TTL
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["never", "1h", "24h", "7d", "30d"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setExpiryOption(opt);
                      setCustomExpiry("");
                    }}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      expiryOption === opt && !customExpiry
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {opt === "never" ? "Never" : opt.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[11px] text-zinc-400">Or pick specific date & time:</span>
                <input
                  type="datetime-local"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {!isAuthenticated ? (
              <p className="text-xs text-zinc-400">
                Tip:{" "}
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Sign in with Demo Account
                </button>{" "}
                to save links to your personal cloud.
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Cloud sync enabled</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:brightness-110 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Result Card */
        <div ref={resultCardRef} className="mt-6 space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{result.message || "Your shortened link is live!"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="truncate pr-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Short URL
              </span>
              <p className="text-base font-mono font-bold text-indigo-400 truncate">
                {result.shortUrl}
              </p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                Target: {result.originalUrl}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Test short link in new tab"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {onOpenQr && (
                <button
                  onClick={() =>
                    onOpenQr(result.shortCode || "link", result.id || "temp")
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  <span>📱</span>
                  <span>View QR Code</span>
                </button>
              )}

              {onOpenAnalytics && (
                <button
                  onClick={() =>
                    onOpenAnalytics(result.shortCode || "link", result.id || "temp")
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  <span>📊</span>
                  <span>View Analytics</span>
                </button>
              )}
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-indigo-400 hover:underline"
            >
              + Shorten Another Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}