"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchUrls, deleteUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  SearchIcon,
  CopyIcon,
  CheckIcon,
  AdsClickIcon,
  QrCodeIcon,
  InsightsIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon,
  LinkIcon,
} from "./Icons";

interface RecentLinksProps {
  refreshTrigger?: number;
  onOpenAnalytics: (shortCode: string, id: string | number) => void;
  onOpenQr: (shortCode: string, id: string | number) => void;
  onOpenEdit: (item: ShortenedUrl) => void;
  showAllControls?: boolean;
}

export default function RecentLinks({
  refreshTrigger,
  onOpenAnalytics,
  onOpenQr,
  onOpenEdit,
  showAllControls = true,
}: RecentLinksProps) {
  const { token } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [sortBy, setSortBy] = useState<"newest" | "clicks">("newest");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchUrls(token)
      .then((data) => {
        if (isMounted) {
          setLinks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load URLs:", err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, refreshTrigger]);

  const copyToClipboard = (shortCode: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const fullUrl = `${origin}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this short link?")) return;
    setDeletingId(id);

    try {
      await deleteUrl(id, token);
      setLinks((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete link:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const isExpired = (item: ShortenedUrl) => {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  };

  const filteredLinks = useMemo(() => {
    return links
      .filter((item) => {
        // Status filter
        if (statusFilter === "active" && isExpired(item)) return false;
        if (statusFilter === "expired" && !isExpired(item)) return false;

        // Search filter
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          item.short_code.toLowerCase().includes(query) ||
          item.original_url.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "clicks") {
          return (b.click_count || 0) - (a.click_count || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [links, statusFilter, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar: Search, filter & sort */}
      {showAllControls && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/40 shadow-xs">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by slug or target URL..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#14141a] text-xs text-zinc-100 placeholder:text-zinc-500 border border-white/10 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter tabs & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#14141a] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All ({links.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "active"
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Active ({links.filter((l) => !isExpired(l)).length})
              </button>
              <button
                onClick={() => setStatusFilter("expired")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "expired"
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Expired ({links.filter(isExpired).length})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "clicks")}
              className="h-9 px-3 rounded-xl bg-[#14141a] border border-white/10 text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-zinc-900 text-zinc-200">Sort: Newest</option>
              <option value="clicks" className="bg-zinc-900 text-zinc-200">Sort: Most Clicks</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full bg-[#0e0e12]/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <RefreshIcon size={32} className="text-indigo-400 animate-spin" />
            <span className="text-xs font-medium">Loading link telemetry...</span>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/5 flex items-center justify-center text-zinc-400 mb-3">
              <LinkIcon size={24} />
            </div>
            <p className="text-sm font-semibold text-zinc-200">No links found</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {searchQuery
                ? "No shortened links match your filter criteria."
                : "Create your first shortened link to view performance telemetry."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#14141a]/60 border-b border-white/10 text-[11px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                  <th className="py-2.5 px-4 font-semibold">Short Link</th>
                  <th className="py-2.5 px-4 font-semibold hidden md:table-cell">
                    Destination URL
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center">Clicks</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredLinks.map((item) => {
                  const expired = isExpired(item);
                  const isCopied = copiedCode === item.short_code;
                  const isDeleting = deletingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${
                        isDeleting ? "opacity-30" : ""
                      }`}
                    >
                      {/* Short URL & alias */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(item.short_code)}
                            type="button"
                            title="Copy short link"
                            className="font-mono text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 group"
                          >
                            <span>/{item.short_code}</span>
                            <span className="text-zinc-500 group-hover:text-indigo-400">
                              {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                            </span>
                          </button>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5 md:hidden truncate max-w-[200px]">
                          {item.original_url}
                        </div>
                      </td>

                      {/* Destination URL */}
                      <td className="py-3.5 px-4 hidden md:table-cell max-w-xs lg:max-w-md">
                        <p className="text-xs text-zinc-400 truncate">
                          {item.original_url}
                        </p>
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#181822] text-zinc-200 border border-white/5">
                          <AdsClickIcon size={14} className="text-indigo-400" />
                          {item.click_count || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800/60 text-zinc-400 border border-white/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenQr(item.short_code, item.id)}
                            type="button"
                            title="QR Code"
                            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          >
                            <QrCodeIcon size={18} />
                          </button>

                          <button
                            onClick={() => onOpenAnalytics(item.short_code, item.id)}
                            type="button"
                            title="Analytics"
                            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-indigo-400 transition-colors"
                          >
                            <InsightsIcon size={18} />
                          </button>

                          <button
                            onClick={() => onOpenEdit(item)}
                            type="button"
                            title="Edit alias or destination"
                            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          >
                            <EditIcon size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            type="button"
                            title="Delete link"
                            className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <TrashIcon size={18} />
                          </button>
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
    </div>
  );
}
