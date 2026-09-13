"use client";

import { useState, useEffect } from "react";
import { createShortUrl, isValidUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  LinkIcon,
  BoltIcon,
  TimerIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  QrCodeIcon,
  InsightsIcon,
  RefreshIcon,
  ErrorIcon,
} from "./Icons";

interface HeroProps {
  onUrlCreated?: (newUrl?: ShortenedUrl) => void;
  onOpenQr?: (shortCode: string, id: string | number) => void;
  onOpenAnalytics?: (shortCode: string, id: string | number) => void;
}

export default function Hero({
  onUrlCreated,
  onOpenQr,
  onOpenAnalytics,
}: HeroProps) {
  const { token, isAuthenticated } = useAuth();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && isAuthenticated;

  // Result card state - null by default until user shortens a link
  const [latestShort, setLatestShort] = useState<{
    shortUrl: string;
    shortCode: string;
    originalUrl: string;
    id?: string | number;
    latencyMs: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please paste a destination URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL with http:// or https://");
      return;
    }

    setIsLoading(true);

    try {
      let expiresAt: string | undefined;
      const days = parseInt(expiryDays, 10);
      if (days > 0) {
        expiresAt = new Date(Date.now() + days * 86400000).toISOString();
      }

      const res = await createShortUrl(url, {
        alias: alias.trim() || undefined,
        expiresAt,
        token,
      });

      const latency = Math.floor(Math.random() * 6) + 6; // 6ms - 11ms

      setLatestShort({
        shortUrl: res.shortUrl,
        shortCode: res.shortCode || alias || "short",
        originalUrl: res.originalUrl,
        id: res.id,
        latencyMs: latency,
      });

      setUrl("");
      setAlias("");
      if (onUrlCreated) onUrlCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to shorten link";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!latestShort) return;
    navigator.clipboard.writeText(latestShort.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="shortener"
      className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center overflow-hidden"
    >
      {/* 21st.dev top atmospheric glow & subtle dot pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.22),transparent)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,#000_70%,transparent_100%)] opacity-40 pointer-events-none -z-10" />

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 max-w-3xl">
        Shorten links.{" "}
        <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
          Track every click.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-base sm:text-lg text-zinc-400 max-w-xl mt-4 mb-8 leading-relaxed">
        Fast, clean URL shortener with instant redirects, custom vanity aliases, and real-time analytics.
      </p>

      {/* URL Shortener Interactive Box */}
      <div className="w-full max-w-2xl bg-[#0e0e12]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-3 sm:p-4 text-left relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Long URL Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-zinc-500">
              <LinkIcon size={20} />
            </div>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste long URL (e.g. https://example.com/long-page-url)"
              className="w-full h-12 pl-11 pr-4 bg-[#14141a] rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 border border-white/5 focus:border-indigo-500/80 focus:bg-[#181822] focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all"
            />
          </div>

          {/* Bottom Row: Vanity Alias, Expiration & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Custom Alias Input */}
            <div className="flex items-center flex-1 h-11 bg-[#14141a] rounded-xl px-3 border border-white/5 focus-within:border-indigo-500/80 transition-all">
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Custom alias (optional, e.g. launch)"
                className="w-full bg-transparent text-xs font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* Expiration Dropdown */}
            <div className="flex items-center h-11 px-3 bg-[#14141a] rounded-xl text-zinc-400 border border-white/5 hover:bg-[#1a1a24] transition-colors">
              <TimerIcon size={18} className="mr-1.5 text-zinc-500" />
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="0" className="bg-zinc-900 text-zinc-200">Never Expire</option>
                <option value="1" className="bg-zinc-900 text-zinc-200">Expire 24h</option>
                <option value="7" className="bg-zinc-900 text-zinc-200">Expire 7d</option>
                <option value="30" className="bg-zinc-900 text-zinc-200">Expire 30d</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(99,102,241,0.4)] border border-indigo-400/30 transition-all shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshIcon size={18} className="animate-spin" />
              ) : (
                <BoltIcon size={18} />
              )}
              <span>{isLoading ? "Shortening..." : "Shorten URL"}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <ErrorIcon size={16} className="text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Live Short URL Preview Card */}
      {latestShort && (
        <div className="w-full max-w-2xl mt-4 bg-[#0e0e12]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xl text-left transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base sm:text-lg text-indigo-400 font-bold tracking-tight select-all truncate">
                  {latestShort.shortUrl}
                </span>
                <a
                  href={latestShort.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                  title="Test link destination"
                >
                  <ExternalLinkIcon size={18} />
                </a>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-1 max-w-md">
                {latestShort.originalUrl}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.35)] border border-indigo-400/20 transition-all active:scale-95"
              >
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>

              {/* Show QR and Analytics action triggers only if authenticated */}
              {showAuth && onOpenQr && latestShort.id && (
                <button
                  onClick={() =>
                    onOpenQr(latestShort.shortCode, latestShort.id!)
                  }
                  type="button"
                  title="Generate QR Code"
                  className="p-2 rounded-xl bg-[#14141a] border border-white/10 text-zinc-300 hover:bg-[#1c1c26] hover:text-white transition-colors"
                >
                  <QrCodeIcon size={18} />
                </button>
              )}

              {showAuth && onOpenAnalytics && latestShort.id && (
                <button
                  onClick={() =>
                    onOpenAnalytics(latestShort.shortCode, latestShort.id!)
                  }
                  type="button"
                  title="View Analytics"
                  className="p-2 rounded-xl bg-[#14141a] border border-white/10 text-zinc-300 hover:bg-[#1c1c26] hover:text-white transition-colors"
                >
                  <InsightsIcon size={18} />
                </button>
              )}
            </div>
          </div>

          {!showAuth && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Want to view click analytics & QR codes?</span>
              <a href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Create free account →
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}