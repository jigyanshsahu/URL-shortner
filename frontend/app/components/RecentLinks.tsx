"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchUrls, deleteUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
    <div className="w-full">
      {/* Search and Filters Header */}
      {showAllControls && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by alias or target URL..."
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter tabs & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({links.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "active"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Active ({links.filter((l) => !isExpired(l)).length})
              </button>
              <button
                onClick={() => setStatusFilter("expired")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "expired"
                    ? "bg-surface-container-lowest text-on-surface shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Expired ({links.filter(isExpired).length})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "clicks")}
              className="h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface-variant focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="clicks">Sort: Most Clicks</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant gap-3">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
              sync
            </span>
            <span className="text-xs font-medium">Loading link telemetry...</span>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[24px]">link_off</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No links found</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
              {searchQuery
                ? "No shortened links match your filter criteria."
                : "Create your first shortened link to view performance telemetry."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-surface-container-low/60 border-b border-outline-variant/30 text-[11px] uppercase font-bold text-outline tracking-wider font-mono">
                  <th className="py-2.5 px-4 font-semibold">Short Link</th>
                  <th className="py-2.5 px-4 font-semibold hidden md:table-cell">
                    Destination URL
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center">Clicks</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredLinks.map((item) => {
                  const expired = isExpired(item);
                  const isCopied = copiedCode === item.short_code;
                  const isDeleting = deletingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
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
                            className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1 group"
                          >
                            <span>linkly.app/{item.short_code}</span>
                            <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary">
                              {isCopied ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                        <div className="text-[11px] text-outline font-mono mt-0.5 md:hidden truncate max-w-[200px]">
                          {item.original_url}
                        </div>
                      </td>

                      {/* Destination URL */}
                      <td className="py-3.5 px-4 hidden md:table-cell max-w-xs lg:max-w-md">
                        <p className="text-xs text-on-surface-variant truncate">
                          {item.original_url}
                        </p>
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface">
                          <span className="material-symbols-outlined text-[14px] text-primary">
                            ads_click
                          </span>
                          {item.click_count || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface-variant">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-tertiary-container/15 text-tertiary-container border border-tertiary-container/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
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
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              qr_code_2
                            </span>
                          </button>

                          <button
                            onClick={() => onOpenAnalytics(item.short_code, item.id)}
                            type="button"
                            title="Analytics"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              insights
                            </span>
                          </button>

                          <button
                            onClick={() => onOpenEdit(item)}
                            type="button"
                            title="Edit URL"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            type="button"
                            title="Delete"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
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
