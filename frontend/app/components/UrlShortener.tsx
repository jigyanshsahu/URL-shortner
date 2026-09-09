"use client";

import { useState, useId } from "react";
import { createShortUrl, isValidUrl, normalizeUrl } from "../lib/api";

interface UrlShortenerProps {
  onUrlCreated?: () => void;
}

export default function UrlShortener({ onUrlCreated }: UrlShortenerProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const inputId = useId();

  async function handleShorten(e?: React.FormEvent) {
    if (e) e.preventDefault();

    setError(null);
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a valid URL to shorten.");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid web address (e.g. example.com or https://example.com).");
      return;
    }

    setLoading(true);

    try {
      const result = await createShortUrl(trimmed);
      setShortUrl(result.shortUrl);
      setOriginalUrl(result.originalUrl || normalizeUrl(trimmed));
      setIsExisting(Boolean(result.existing));
      setUrl("");
      if (onUrlCreated) {
        onUrlCreated();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to shorten URL. Make sure backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // Generate QR code URL using standard QR image endpoint
  const qrCodeUrl = shortUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        shortUrl
      )}`
    : "";

  return (
    <div
      id="shortener"
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
    >
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Shorten a URL</h3>
          <p className="text-xs text-zinc-400">
            Paste your long link to create a clean, tracked short link
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Live API
        </span>
      </div>

      <form onSubmit={handleShorten} className="space-y-4">
        <div>
          <label htmlFor={inputId} className="sr-only">
            Enter your destination URL
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <input
                id={inputId}
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://example.com/very-long-url-path..."
                disabled={loading}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <span className="text-xs">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <svg
              className="h-4 w-4 shrink-0 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="flex-1">{error}</span>
          </div>
        )}
      </form>

      {/* Result Display Card */}
      {shortUrl && (
        <div className="mt-6 rounded-xl border border-zinc-700/80 bg-zinc-950/70 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {isExisting ? "Existing link found" : "Link generated!"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              {showQr ? "Hide QR" : "QR Code"}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block truncate text-base font-semibold text-indigo-400 underline-offset-4 hover:underline sm:text-lg"
              >
                {shortUrl}
              </a>
              {originalUrl && (
                <p
                  className="truncate text-xs text-zinc-500"
                  title={originalUrl}
                >
                  Destination: {originalUrl}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  copied
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-white text-zinc-950 hover:bg-zinc-200"
                }`}
              >
                {copied ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white"
              >
                Visit ↗
              </a>
            </div>
          </div>

          {/* QR Code Modal / View */}
          {showQr && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-4">
              <div className="rounded-lg bg-white p-2 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${shortUrl}`}
                  className="h-36 w-36"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-center text-xs text-zinc-400">
                Scan with any phone camera to visit this link
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}