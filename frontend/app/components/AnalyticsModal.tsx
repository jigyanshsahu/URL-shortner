"use client";

import React, { useEffect, useState } from "react";
import { fetchUrlAnalytics, UrlAnalytics } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import D3TimelineChart from "./charts/D3TimelineChart";
import { InsightsIcon, CloseIcon, RefreshIcon } from "./Icons";

interface AnalyticsModalProps {
  urlId: string | number | null;
  shortCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsModal({
  urlId,
  shortCode,
  isOpen,
  onClose,
}: AnalyticsModalProps) {
  const { token } = useAuth();
  const [data, setData] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !urlId) return;

    let isSubscribed = true;
    fetchUrlAnalytics(urlId, token)
      .then((res) => {
        if (isSubscribed) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error("Failed to load analytics:", err);
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, urlId, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                <InsightsIcon size={18} />
              </div>
              <h3 className="font-bold text-base text-on-surface">
                Link Telemetry Drilldown
              </h3>
            </div>
            <p className="font-mono text-xs font-semibold text-primary mt-1">
              linkly.app/{shortCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <RefreshIcon size={28} className="text-primary animate-spin" />
            <span className="text-xs font-mono">Fetching edge telemetry logs...</span>
          </div>
        ) : (
          <div className="py-4 flex flex-col gap-6">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-mono font-bold text-outline">
                  Total Clicks
                </span>
                <div className="text-xl font-extrabold text-on-surface mt-1">
                  {data?.url.totalClicks?.toLocaleString() || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-mono font-bold text-outline">
                  Clicks Today
                </span>
                <div className="text-xl font-extrabold text-primary mt-1">
                  {data?.clicksToday || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-mono font-bold text-outline">
                  Status
                </span>
                <div className="text-xs font-bold text-tertiary-container mt-2 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                  ACTIVE 200
                </div>
              </div>
            </div>

            {/* Click Velocity Chart (D3.js) */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-on-surface">Click Velocity (D3.js Timeline)</span>
                <span className="font-mono text-[10px] text-primary font-semibold px-2 py-0.5 rounded bg-surface-container-high">
                  LAST 7 DAYS
                </span>
              </div>
              <div className="w-full">
                <D3TimelineChart
                  data={data?.clicksByDay && data.clicksByDay.length > 0 ? data.clicksByDay : []}
                  height={150}
                  barColor="#4F46E5"
                  highlightColor="#6366F1"
                />
              </div>
            </div>

            {/* Referrers */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface mb-3 block">
                Top Inbound Referrers
              </span>
              <div className="flex flex-col gap-2.5">
                {(data?.topReferrers || []).map((ref, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-on-surface truncate">{ref.referrer}</span>
                    <span className="font-mono text-primary font-bold">{ref.clicks} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination footer */}
            <div className="text-[11px] text-outline font-mono truncate">
              Destination: {data?.url.originalUrl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
