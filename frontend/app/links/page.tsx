"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ConsoleHeader from "../components/ConsoleHeader";
import RecentLinks from "../components/RecentLinks";
import CreateLinkModal from "../components/CreateLinkModal";
import AnalyticsModal from "../components/AnalyticsModal";
import QrModal from "../components/QrModal";
import EditUrlModal from "../components/EditUrlModal";
import { fetchUrls, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function LinksPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime] = useState(() => Date.now());

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
    const total = links.length;
    const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
    const active = links.filter((l) => !l.expires_at || new Date(l.expires_at).getTime() > currentTime).length;
    const expiredSoon = links.filter((l) => {
      if (!l.expires_at) return false;
      const diff = new Date(l.expires_at).getTime() - currentTime;
      return diff > 0 && diff < 7 * 86400000;
    }).length;

    return { total, totalClicks, active, expiredSoon };
  }, [links, currentTime]);

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
          pageTitle="My Links & Directory"
          onOpenCreateModal={() => setCreateModalOpen(true)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl">
          {/* Summary Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Total Links
                </span>
                <div className="text-xl font-extrabold text-on-surface mt-0.5">
                  {stats.total.toLocaleString()}
                </div>
                <span className="text-[11px] text-tertiary-container font-mono">
                  All active domains
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Total Clicks
                </span>
                <div className="text-xl font-extrabold text-on-surface mt-0.5">
                  {stats.totalClicks.toLocaleString()}
                </div>
                <span className="text-[11px] text-tertiary-container font-mono">
                  +18.4% this week
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">ads_click</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Active Health
                </span>
                <div className="text-xl font-extrabold text-on-surface mt-0.5">
                  {stats.active.toLocaleString()}
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {stats.total ? Math.round((stats.active / stats.total) * 100) : 100}% ratio
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Expiring Soon
                </span>
                <div className="text-xl font-extrabold text-on-surface mt-0.5">
                  {stats.expiredSoon}
                </div>
                <span className="text-[11px] text-error font-mono">
                  {stats.expiredSoon > 0 ? "Review expiration" : "All healthy"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
            </div>
          </div>

          {/* Directory Component */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Link Directory</h2>
                <p className="text-xs text-on-surface-variant">
                  Manage targets, vanity custom aliases, expiration timers, and QR codes.
                </p>
              </div>

              <button
                onClick={() => setCreateModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Short Link</span>
              </button>
            </div>

            <RecentLinks
              refreshTrigger={refreshTrigger}
              onOpenAnalytics={handleOpenAnalytics}
              onOpenQr={handleOpenQr}
              onOpenEdit={handleOpenEdit}
              showAllControls={true}
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
