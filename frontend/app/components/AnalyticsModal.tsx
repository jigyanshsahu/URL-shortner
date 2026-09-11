"use client";

import React, { useEffect, useState } from "react";
import { fetchUrlAnalytics, UrlAnalytics } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
              <span className="material-symbols-outlined text-primary text-[20px]">
                insights
              </span>
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
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
              sync
            </span>
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

            {/* Click Distribution Chart */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface">Click Velocity (Last 7 Days)</span>
              <div className="flex items-end justify-between gap-2 h-36 pt-6 pb-2 px-1 border-b border-outline-variant/30">
                {(data?.clicksByDay || []).map((day, idx) => {
                  const max = Math.max(...(data?.clicksByDay || []).map((d) => d.clicks), 1);
                  const pct = Math.max(15, Math.round((day.clicks / max) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-mono text-outline">{day.clicks}</span>
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full max-w-[32px] bg-primary-container rounded-t-md"
                      />
                      <span className="text-[10px] font-mono text-on-surface-variant font-medium">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
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
