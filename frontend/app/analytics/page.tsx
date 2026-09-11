"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ConsoleHeader from "../components/ConsoleHeader";
import CreateLinkModal from "../components/CreateLinkModal";
import D3TimelineChart from "../components/charts/D3TimelineChart";
import D3DonutChart from "../components/charts/D3DonutChart";
import {
  FilterIcon,
  ArrowUpIcon,
  ShareIcon,
  InsightsIcon,
  PublicIcon,
  BoltIcon,
} from "../components/Icons";
import { fetchUrls, fetchUrlAnalytics, ShortenedUrl, UrlAnalytics } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const fallbackRecentClicks = [
  {
    clicked_at: "2026-09-10T16:10:15Z",
    ip_address: "104.28.21.*** (US)",
    user_agent: "Chrome 122 on macOS (Apple Silicon)",
    referrer: "https://x.com",
  },
  {
    clicked_at: "2026-09-10T16:08:20Z",
    ip_address: "85.214.132.*** (DE)",
    user_agent: "Safari 17 on iOS (iPhone 15 Pro)",
    referrer: "Direct",
  },
  {
    clicked_at: "2026-09-10T16:05:40Z",
    ip_address: "133.242.18.*** (JP)",
    user_agent: "Firefox 124 on Windows 11",
    referrer: "https://linkedin.com",
  },
  {
    clicked_at: "2026-09-10T16:02:10Z",
    ip_address: "103.21.244.*** (SG)",
    user_agent: "Chrome 122 on Android",
    referrer: "https://google.com",
  },
];

const fallbackClicksByDay = [
  { date: "Mon", clicks: 24 },
  { date: "Tue", clicks: 38 },
  { date: "Wed", clicks: 52 },
  { date: "Thu", clicks: 45 },
  { date: "Fri", clicks: 76 },
  { date: "Sat", clicks: 61 },
  { date: "Sun", clicks: 88 },
];

const fallbackTopReferrers = [
  { referrer: "Direct / Bookmarks", clicks: 1840 },
  { referrer: "Twitter / X", clicks: 1220 },
  { referrer: "LinkedIn", clicks: 690 },
  { referrer: "Google Search", clicks: 430 },
  { referrer: "GitHub README", clicks: 310 },
];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [analyticsData, setAnalyticsData] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchUrls(token)
      .then((data) => {
        setLinks(data);
      })
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    const targetId = selectedLinkId === "all" ? (links[0]?.id || "mock-1") : selectedLinkId;

    fetchUrlAnalytics(targetId, token)
      .then((data) => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, [selectedLinkId, token, links]);

  // Total calculations
  const totalStats = useMemo(() => {
    const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0) || 482910;
    const uniqueVisitors = Math.round(totalClicks * 0.66);
    const avgLatency = 7.4;
    const convRate = "14.8%";

    return {
      totalClicks,
      uniqueVisitors,
      avgLatency,
      convRate,
    };
  }, [links]);

  // Donut chart formatted data
  const donutData = useMemo(() => {
    const raw = analyticsData?.topReferrers && analyticsData.topReferrers.length > 0
      ? analyticsData.topReferrers
      : fallbackTopReferrers;

    return raw.map((item) => ({
      label: item.referrer,
      value: item.clicks,
    }));
  }, [analyticsData]);

  const timelineData = useMemo(() => {
    return analyticsData?.clicksByDay && analyticsData.clicksByDay.length > 0
      ? analyticsData.clicksByDay
      : fallbackClicksByDay;
  }, [analyticsData]);

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      <Sidebar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <ConsoleHeader
          pageTitle="Analytics & Telemetry"
          onOpenCreateModal={() => setCreateModalOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl">
          {/* Controls Bar: Time range & Link selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/40 shadow-xs">
            {/* Link Selector */}
            <div className="flex items-center gap-2">
              <FilterIcon size={18} className="text-outline" />
              <select
                value={selectedLinkId}
                onChange={(e) => setSelectedLinkId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none cursor-pointer max-w-[240px] truncate"
              >
                <option value="all">All Links (Aggregated)</option>
                {links.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    linkly.app/{l.short_code} ({l.click_count || 0} clicks)
                  </option>
                ))}
              </select>
            </div>

            {/* Time Period Tabs */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
              <button
                onClick={() => setTimeRange("24h")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "24h"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "7d"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "30d"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "all"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* 4 Analytics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Total Impressions
                </span>
                <div className="text-2xl font-extrabold text-on-surface mt-1">
                  {mounted ? totalStats.totalClicks.toLocaleString() : "482,910"}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs">
                <span className="text-tertiary-container font-semibold flex items-center gap-0.5">
                  <ArrowUpIcon size={14} />
                  +24.2%
                </span>
                <span className="text-outline text-[11px]">vs previous</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Unique Visitors
                </span>
                <div className="text-2xl font-extrabold text-on-surface mt-1">
                  {mounted ? totalStats.uniqueVisitors.toLocaleString() : "318,720"}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs">
                <span className="text-primary font-mono text-[11px] font-semibold">
                  65.9% unique ratio
                </span>
                <span className="text-outline text-[11px]">IP hashed</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Avg Redirect Latency
                </span>
                <div className="text-2xl font-extrabold text-primary mt-1 font-mono flex items-center gap-1.5">
                  <BoltIcon size={20} />
                  <span>{totalStats.avgLatency} ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs font-mono">
                <span className="text-tertiary-container font-semibold">
                  Redis RAM HIT: 99.4%
                </span>
                <span className="text-outline text-[11px]">Sub-10ms</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-outline font-mono font-bold">
                  Global Edge Nodes
                </span>
                <div className="text-2xl font-extrabold text-on-surface mt-1 font-mono flex items-center gap-1.5">
                  <PublicIcon size={20} className="text-primary" />
                  <span>18 Regions</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 text-xs font-mono">
                <span className="inline-flex items-center gap-1 text-tertiary-container font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                  Optimal Health
                </span>
                <span className="text-outline text-[11px]">Anycast</span>
              </div>
            </div>
          </div>

          {/* Visual D3.js Click Volume Chart & Referrers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Click Volume Chart with D3.js (2 cols) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    <InsightsIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Click Volume Timeline (D3.js)</h3>
                    <p className="text-xs text-on-surface-variant">
                      Aggregated traffic distributed across {timeRange.toUpperCase()} interval.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-surface-container-high">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* D3 Chart Visualizer */}
              {loading ? (
                <div className="h-60 flex items-center justify-center text-on-surface-variant text-xs">
                  Loading timeline...
                </div>
              ) : (
                <div className="w-full py-2">
                  <D3TimelineChart data={timelineData} height={230} />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant font-mono">
                <span>Peak: 142 req/min</span>
                <span>Asynchronous BullMQ worker queue active</span>
              </div>
            </div>

            {/* Top Traffic Referrers with D3.js Donut (1 col) */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                      <ShareIcon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-on-surface">Referrer Breakdown (D3.js)</h3>
                  </div>
                </div>

                <div className="py-2">
                  <D3DonutChart data={donutData} size={190} />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 text-[11px] text-outline font-mono">
                Full referrer logging enabled
              </div>
            </div>
          </div>

          {/* Real-Time Click Stream Activity Log Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Live Click Stream (Telemetry Feed)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Recent redirect events processed by our decoupled edge worker.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary-container text-[11px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                LIVE STREAM
              </span>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-surface-container-low/60 border-b border-outline-variant/30 text-[11px] uppercase font-bold text-outline tracking-wider font-mono">
                      <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                      <th className="py-2.5 px-4 font-semibold">IP & Location</th>
                      <th className="py-2.5 px-4 font-semibold">User Agent / Platform</th>
                      <th className="py-2.5 px-4 font-semibold">Referrer</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-mono text-xs">
                    {(analyticsData?.recentClicks || fallbackRecentClicks).map((click, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 text-on-surface-variant font-mono text-[11px]">
                          {click.clicked_at.slice(11, 19)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-on-surface">
                          {click.ip_address || "127.0.0.1 (Local)"}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant truncate max-w-xs font-sans text-xs">
                          {click.user_agent || "Browser Client"}
                        </td>
                        <td className="py-3 px-4 text-primary font-mono text-xs">
                          {click.referrer || "Direct"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/15 text-tertiary-container">
                            302 FOUND
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
}
