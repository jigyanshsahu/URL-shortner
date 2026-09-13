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
      className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center overflow-hidden"
    >
      {/* Subtle atmospheric glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-[260px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface max-w-3xl">
        Shorten links.{" "}
        <span className="bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">
          Track every click.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mt-4 mb-8 leading-relaxed">
        Fast, clean URL shortener with instant redirects, custom vanity aliases, and real-time analytics.
      </p>

      {/* URL Shortener Interactive Box */}
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-md p-3 sm:p-4 text-left relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Long URL Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-outline">
              <LinkIcon size={20} />
            </div>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste long URL (e.g. https://example.com/long-page-url)"
              className="w-full h-12 pl-11 pr-4 bg-surface rounded-xl text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-primary-container focus:bg-surface-bright focus:outline-none transition-all"
            />
          </div>

          {/* Bottom Row: Vanity Alias, Expiration & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Custom Alias Input */}
            <div className="flex items-center flex-1 h-11 bg-surface rounded-xl px-3 border border-transparent focus-within:border-primary-container transition-all">
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Custom alias (optional, e.g. launch)"
                className="w-full bg-transparent text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none"
              />
            </div>

            {/* Expiration Dropdown */}
            <div className="flex items-center h-11 px-3 bg-surface rounded-xl text-on-surface-variant border border-transparent hover:bg-surface-container-high transition-colors">
              <TimerIcon size={18} className="mr-1.5 text-outline" />
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="bg-transparent text-xs font-medium text-on-surface-variant focus:outline-none cursor-pointer"
              >
                <option value="0">Never Expire</option>
                <option value="1">Expire 24h</option>
                <option value="7">Expire 7d</option>
                <option value="30">Expire 30d</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 disabled:opacity-50"
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
          <div className="mt-2.5 p-2.5 rounded-lg bg-error-container/40 border border-error-container text-on-error-container text-xs flex items-center gap-2">
            <ErrorIcon size={16} className="text-error" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Live Short URL Preview Card */}
      {/* Generated Live Short URL Preview Card */}
      {latestShort && (
        <div className="w-full max-w-2xl mt-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-4 sm:p-5 shadow-sm text-left transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Ready
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base sm:text-lg text-primary font-bold tracking-tight select-all truncate">
                  {latestShort.shortUrl}
                </span>
                <a
                  href={latestShort.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-outline hover:text-on-surface transition-colors"
                  title="Test link destination"
                >
                  <ExternalLinkIcon size={18} />
                </a>
              </div>
              <p className="text-xs text-on-surface-variant truncate mt-1 max-w-md">
                {latestShort.originalUrl}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all active:scale-95 shadow-xs"
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
                  className="p-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
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
                  className="p-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                >
                  <InsightsIcon size={18} />
                </button>
              )}
            </div>
          </div>

          {!showAuth && (
            <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Want to view click analytics & QR codes?</span>
              <a href="/register" className="font-semibold text-primary hover:underline">
                Create free account →
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}