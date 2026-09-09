"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchUrls, ShortenedUrl } from "../lib/api";

interface RecentLinksProps {
  refreshTrigger?: number;
}

export default function RecentLinks({ refreshTrigger }: RecentLinksProps) {
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadUrls = useCallback(() => {
    setLoading(true);
    fetchUrls()
      .then((data) => {
        setLinks(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchUrls().then((data) => {
      if (!ignore) {
        setLinks(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  function copyToClipboard(shortCode: string) {
    const fullUrl = `${window.location.protocol}//${window.location.hostname}:5000/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(shortCode);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalClicks = links.reduce((sum, item) => sum + (Number(item.click_count) || 0), 0);

  return (
    <section id="analytics" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-indigo-400 mb-3">
            <span>📊</span>
            <span>Real-time Analytics</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Recent Links & Performance
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Track clicks and redirects live as visitors interact with your shortened links.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Links</p>
            <p className="text-2xl font-bold text-white">{links.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Clicks</p>
            <p className="text-2xl font-bold text-indigo-400">{totalClicks}</p>
          </div>
          <button
            onClick={loadUrls}
            disabled={loading}
            title="Refresh links"
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-400 hover:text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            <svg
              className={`h-5 w-5 ${loading ? "animate-spin text-indigo-400" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table / List Container */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl backdrop-blur-sm">
        {loading && links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <svg
              className="h-8 w-8 animate-spin text-indigo-500"
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
            <p className="mt-3 text-sm">Loading links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="rounded-full bg-zinc-800/80 p-4 text-3xl">🔗</div>
            <h4 className="mt-4 text-base font-semibold text-white">No shortened URLs yet</h4>
            <p className="mt-1 text-sm text-zinc-400 max-w-sm">
              Use the form above to shorten your first link and start collecting click analytics.
            </p>
            <a
              href="#shortener"
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              Shorten a link now
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Short Link</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Original Destination</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Clicks</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Created</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {links.map((link) => {
                  const targetUrl = link.original_url;
                  const shortUrl = `http://localhost:5000/${link.short_code}`;
                  const createdDate = link.created_at
                    ? new Date(link.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now";

                  return (
                    <tr
                      key={link.id || link.short_code}
                      className="transition hover:bg-zinc-800/40"
                    >
                      {/* Short Link */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            /{link.short_code}
                          </a>
                        </div>
                      </td>

                      {/* Original URL */}
                      <td className="max-w-xs truncate px-6 py-4 text-zinc-400 sm:max-w-md">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={targetUrl}
                          className="truncate hover:text-zinc-200 hover:underline block"
                        >
                          {targetUrl}
                        </a>
                      </td>

                      {/* Clicks */}
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-200">
                          🔥 {link.click_count || 0}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                        {createdDate}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link.short_code)}
                            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                          >
                            {copiedId === link.short_code ? "✓ Copied" : "Copy"}
                          </button>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:bg-zinc-700 hover:text-indigo-300"
                          >
                            Test ↗
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
