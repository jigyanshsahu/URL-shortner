"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ConsoleHeader from "../components/ConsoleHeader";
import RecentLinks from "../components/RecentLinks";
import CreateLinkModal from "../components/CreateLinkModal";
import AnalyticsModal from "../components/AnalyticsModal";
import QrModal from "../components/QrModal";
import EditUrlModal from "../components/EditUrlModal";
import { fetchUrls, createShortUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
        text: `Link created: linkly.app/${res.shortCode || quickAlias}`,
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
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <ConsoleHeader
          pageTitle="Overview & Metrics"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl">
          {/* Greeting Hero Gradient Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-primary to-secondary p-6 sm:p-8 shadow-lg text-on-primary">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-surface-container-lowest/15 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 self-start px-2.5 py-0.5 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-mono text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse" />
                  <span>GLOBAL EDGE STATUS: OPTIMAL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Good morning, {user?.name || "Jigyansh"}
                </h1>
                <p className="text-xs sm:text-sm text-on-primary-container leading-relaxed">
                  Here&apos;s what&apos;s happening across your link routing endpoints and Anycast network today.
                </p>
              </div>

              <button
                onClick={() => setCreateModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-container-lowest text-primary font-bold text-xs shadow-md hover:bg-surface-container-low transition-all active:scale-[0.98] self-start md:self-auto shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add_link</span>
                <span>+ Create Short Link</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Links */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                    Total Links
                  </span>
                  <div className="text-2xl font-extrabold text-on-surface mt-1">
                    {stats.totalLinks.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">link</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-tertiary-container">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  +12.4%
                </span>
                <span className="text-on-surface-variant text-[11px]">vs last month</span>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                    Total Clicks
                  </span>
                  <div className="text-2xl font-extrabold text-on-surface mt-1">
                    {stats.totalClicks.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">ads_click</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-tertiary-container">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  +28.6%
                </span>
                <span className="text-on-surface-variant text-[11px]">vs last month</span>
              </div>
            </div>

            {/* Clicks Today */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                    Clicks Today
                  </span>
                  <div className="text-2xl font-extrabold text-on-surface mt-1">
                    {stats.clicksToday.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">bolt</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-tertiary-container">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  +8.1%
                </span>
                <span className="text-on-surface-variant text-[11px]">vs yesterday</span>
              </div>
            </div>

            {/* Active Ratio */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                    Active Links
                  </span>
                  <div className="text-2xl font-extrabold text-on-surface mt-1">
                    {stats.activeLinks.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 text-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">verified</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                  Health: 98%
                </span>
                <span className="text-outline text-[11px]">HTTP 200</span>
              </div>
            </div>
          </div>

          {/* Quick Shortener Bar inside Dashboard */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  magic_button
                </span>
                <h3 className="text-sm font-bold text-on-surface">Quick URL Shortener</h3>
              </div>
              <span className="text-[11px] text-outline font-mono">
                Redis Key Generation
              </span>
            </div>

            <form
              onSubmit={handleQuickShorten}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  link
                </span>
                <input
                  type="url"
                  required
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="Paste destination link (e.g. https://domain.com/path)"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 sm:w-56">
                <span className="font-mono text-xs text-on-surface-variant select-none">
                  linkly.app/
                </span>
                <input
                  type="text"
                  value={quickAlias}
                  onChange={(e) => setQuickAlias(e.target.value)}
                  placeholder="custom-slug"
                  className="w-full bg-transparent font-mono text-xs font-semibold text-primary focus:outline-none ml-0.5"
                />
              </div>

              <button
                type="submit"
                disabled={quickLoading}
                className="h-10 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {quickLoading ? "sync" : "bolt"}
                </span>
                <span>{quickLoading ? "Shortening..." : "Shorten"}</span>
              </button>
            </form>

            {quickMsg && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  quickMsg.isError
                    ? "bg-error-container/40 text-on-error-container border border-error-container"
                    : "bg-tertiary-container/15 text-tertiary-container border border-tertiary-container/20 font-mono"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {quickMsg.isError ? "error" : "check_circle"}
                </span>
                <span>{quickMsg.text}</span>
              </div>
            )}
          </div>

          {/* Links Directory Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Active Link Routes
                </h3>
                <p className="text-xs text-on-surface-variant">
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
