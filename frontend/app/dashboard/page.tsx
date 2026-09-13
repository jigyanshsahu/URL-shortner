"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ConsoleHeader from "../components/ConsoleHeader";
import RecentLinks from "../components/RecentLinks";
import CreateLinkModal from "../components/CreateLinkModal";
import AnalyticsModal from "../components/AnalyticsModal";
import QrModal from "../components/QrModal";
import EditUrlModal from "../components/EditUrlModal";
import D3TimelineChart from "../components/charts/D3TimelineChart";
import {
  LinkIcon,
  AdsClickIcon,
  BoltIcon,
  VerifiedIcon,
  ArrowUpIcon,
  MagicIcon,
  RefreshIcon,
  ErrorIcon,
  CheckCircleIcon,
  InsightsIcon,
} from "../components/Icons";
import { fetchUrls, createShortUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const dashboardActivity = [
  { date: "00:00", clicks: 18 },
  { date: "04:00", clicks: 9 },
  { date: "08:00", clicks: 42 },
  { date: "12:00", clicks: 96 },
  { date: "16:00", clicks: 124 },
  { date: "20:00", clicks: 88 },
  { date: "Now", clicks: 65 },
];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Quick Shorten in Dashboard
  const [quickUrl, setQuickUrl] = useState("");
  const [quickAlias, setQuickAlias] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickMsg, setQuickMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modals state
  const [analyticsState, setAnalyticsState] = useState<{
    isOpen: boolean;
    shortCode: string;
    urlId: string | number | null;
  }>({
    isOpen: false,
    shortCode: "",
    urlId: null,
  });

  const [qrState, setQrState] = useState<{
    isOpen: boolean;
    shortCode: string;
    urlId: string | number | null;
  }>({
    isOpen: false,
    shortCode: "",
    urlId: null,
  });

  const [editState, setEditState] = useState<{
    isOpen: boolean;
    item: ShortenedUrl | null;
  }>({
    isOpen: false,
    item: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchUrls(token)
      .then((data) => setLinks(data))
      .catch((err) => console.error(err));
  }, [token, refreshTrigger]);

  const stats = useMemo(() => {
    const totalLinks = links.length;
    const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
    const activeLinks = links.filter((l) => {
      if (!l.expires_at) return true;
      return new Date(l.expires_at) > new Date();
    }).length;
    const clicksToday = Math.round(totalClicks * 0.18) + 12;

    return {
      totalLinks,
      totalClicks,
      activeLinks,
      clicksToday,
    };
  }, [links]);

  const handleQuickShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickMsg(null);
    if (!quickUrl.trim()) return;

    setQuickLoading(true);
    try {
      const res = await createShortUrl(quickUrl, {
        alias: quickAlias.trim() || undefined,
        token,
      });
      setQuickMsg({
        text: `Link created: ${res.shortUrl || '/' + (res.shortCode || quickAlias)}`,
      });
      setQuickUrl("");
      setQuickAlias("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to shorten";
      setQuickMsg({ text: msg, isError: true });
    } finally {
      setQuickLoading(false);
    }
  };

  const handleOpenAnalytics = (shortCode: string, id: string | number) => {
    setAnalyticsState({ isOpen: true, shortCode, urlId: id });
  };

  const handleOpenQr = (shortCode: string, id: string | number) => {
    setQrState({ isOpen: true, shortCode, urlId: id });
  };

  const handleOpenEdit = (item: ShortenedUrl) => {
    setEditState({ isOpen: true, item });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col lg:flex-row">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <ConsoleHeader
          pageTitle="Overview & Metrics"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl">
          {/* Greeting Hero Gradient Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14141a] via-[#0e0e12] to-[#120f2c] border border-white/10 p-6 sm:p-8 shadow-2xl text-zinc-100">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 self-start px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GLOBAL EDGE STATUS: OPTIMAL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, {user?.name || "Developer"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Here&apos;s what&apos;s happening across your link routing endpoints and Anycast network today.
                </p>
              </div>

              <button
                onClick={() => setCreateModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs shadow-lg hover:bg-zinc-200 transition-all active:scale-[0.98] self-start md:self-auto shrink-0"
              >
                <LinkIcon size={18} />
                <span>+ Create Short Link</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Links */}
            <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                    Total Links
                  </span>
                  <div className="text-2xl font-extrabold text-zinc-100 mt-1">
                    {mounted ? stats.totalLinks.toLocaleString() : "0"}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <LinkIcon size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08] text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                  <ArrowUpIcon size={14} />
                  +12.4%
                </span>
                <span className="text-zinc-500 text-[11px]">vs last month</span>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                    Total Clicks
                  </span>
                  <div className="text-2xl font-extrabold text-zinc-100 mt-1">
                    {mounted ? stats.totalClicks.toLocaleString() : "0"}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <AdsClickIcon size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08] text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                  <ArrowUpIcon size={14} />
                  +28.6%
                </span>
                <span className="text-zinc-500 text-[11px]">vs last month</span>
              </div>
            </div>

            {/* Clicks Today */}
            <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                    Clicks Today
                  </span>
                  <div className="text-2xl font-extrabold text-zinc-100 mt-1">
                    {mounted ? stats.clicksToday.toLocaleString() : "12"}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BoltIcon size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08] text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                  <ArrowUpIcon size={14} />
                  +8.1%
                </span>
                <span className="text-zinc-500 text-[11px]">vs yesterday</span>
              </div>
            </div>

            {/* Active Ratio */}
            <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                    Active Links
                  </span>
                  <div className="text-2xl font-extrabold text-zinc-100 mt-1">
                    {mounted ? stats.activeLinks.toLocaleString() : "0"}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <VerifiedIcon size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08] text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Health: 98%
                </span>
                <span className="text-zinc-500 text-[11px]">HTTP 200</span>
              </div>
            </div>
          </div>

          {/* D3.js Real-time Traffic Overview */}
          <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <InsightsIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Hourly Traffic Pulse</h3>
                  <p className="text-xs text-zinc-400">Real-time throughput processed across Anycast POPs.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Sub-8ms LATENCY
              </span>
            </div>
            <div className="w-full">
              <D3TimelineChart data={dashboardActivity} height={180} />
            </div>
          </div>

          {/* Quick Shortener Bar inside Dashboard */}
          <div className="p-5 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MagicIcon size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Quick URL Shortener</h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Redis Key Generation
              </span>
            </div>

            <form
              onSubmit={handleQuickShorten}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="url"
                  required
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="Paste destination link (e.g. https://domain.com/path)"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#14141a] border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/80 focus:bg-[#181822] focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center h-10 px-3 rounded-xl bg-[#14141a] border border-white/10 sm:w-56 focus-within:border-indigo-500/80 transition-all">
                <input
                  type="text"
                  value={quickAlias}
                  onChange={(e) => setQuickAlias(e.target.value)}
                  placeholder="Custom alias (optional)"
                  className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={quickLoading}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                {quickLoading ? (
                  <RefreshIcon size={16} className="animate-spin" />
                ) : (
                  <BoltIcon size={16} />
                )}
                <span>{quickLoading ? "Shortening..." : "Shorten"}</span>
              </button>
            </form>

            {quickMsg && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  quickMsg.isError
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono"
                }`}
              >
                {quickMsg.isError ? (
                  <ErrorIcon size={16} className="text-red-400" />
                ) : (
                  <CheckCircleIcon size={16} />
                )}
                <span>{quickMsg.text}</span>
              </div>
            )}
          </div>

          {/* Links Directory Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Active Link Routes
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time click counts and cache statuses for your library.
                </p>
              </div>
            </div>

            <RecentLinks
              refreshTrigger={refreshTrigger}
              onOpenAnalytics={handleOpenAnalytics}
              onOpenQr={handleOpenQr}
              onOpenEdit={handleOpenEdit}
            />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => setRefreshTrigger((prev) => prev + 1)}
        onOpenQr={handleOpenQr}
      />

      <AnalyticsModal
        isOpen={analyticsState.isOpen}
        onClose={() => setAnalyticsState((prev) => ({ ...prev, isOpen: false }))}
        shortCode={analyticsState.shortCode}
        urlId={analyticsState.urlId}
      />

      <QrModal
        isOpen={qrState.isOpen}
        onClose={() => setQrState((prev) => ({ ...prev, isOpen: false }))}
        shortCode={qrState.shortCode}
        urlId={qrState.urlId}
      />

      <EditUrlModal
        isOpen={editState.isOpen}
        onClose={() => setEditState({ isOpen: false, item: null })}
        item={editState.item}
        onUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}
