"use client";

import React, { useState } from "react";
import { updateUrl, ShortenedUrl, isValidUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { EditIcon, CloseIcon, ErrorIcon, RefreshIcon, CheckIcon } from "./Icons";

interface EditUrlModalProps {
  item?: ShortenedUrl | null;
  urlItem?: ShortenedUrl | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated?: ShortenedUrl) => void;
}

function EditUrlForm({
  currentItem,
  token,
  onClose,
  onUpdated,
}: {
  currentItem: ShortenedUrl;
  token: string | null;
  onClose: () => void;
  onUpdated: (updated?: ShortenedUrl) => void;
}) {
  const [destination, setDestination] = useState(currentItem.original_url || "");
  const [alias, setAlias] = useState(currentItem.short_code || "");
  const [expiresAt, setExpiresAt] = useState(
    currentItem.expires_at
      ? new Date(currentItem.expires_at).toISOString().slice(0, 16)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidUrl(destination)) {
      setError("Please provide a valid destination URL (e.g. https://example.com)");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateUrl(
        currentItem.id,
        {
          url: destination,
          alias: alias.trim() || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
        token
      );

      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update URL";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="py-4 flex flex-col gap-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <ErrorIcon size={16} className="text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Destination URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Target Destination
        </label>
        <input
          type="url"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://example.com/target"
          className="w-full h-10 px-3 rounded-xl bg-[#14141a] border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/80 focus:bg-[#181822] focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all"
        />
      </div>

      {/* Alias */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Custom Alias Slug
        </label>
        <div className="flex items-center h-10 px-3 rounded-xl bg-[#14141a] border border-white/10 focus-within:border-indigo-500/80 transition-all">
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="custom-slug"
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Expiration Date/Time */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Expiration Timestamp (Optional)
        </label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-[#14141a] border border-white/10 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08] mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 transition active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshIcon size={16} className="animate-spin" /> : <CheckIcon size={16} />}
          <span>{loading ? "Saving Changes..." : "Save Link"}</span>
        </button>
      </div>
    </form>
  );
}

export default function EditUrlModal({
  item,
  urlItem,
  isOpen,
  onClose,
  onUpdated,
}: EditUrlModalProps) {
  const currentItem = item || urlItem;
  const { token } = useAuth();

  if (!isOpen || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0e0e12] rounded-2xl border border-white/10 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <EditIcon size={18} />
            </div>
            <h3 className="font-bold text-base text-zinc-100">Edit Link Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <EditUrlForm
          key={String(currentItem.id)}
          currentItem={currentItem}
          token={token}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
}
