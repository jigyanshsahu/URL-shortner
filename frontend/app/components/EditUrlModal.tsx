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
        <div className="p-3 rounded-xl bg-error-container/40 border border-error-container text-on-error-container text-xs flex items-center gap-2">
          <ErrorIcon size={16} className="text-error" />
          <span>{error}</span>
        </div>
      )}

      {/* Destination URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
          Target Destination
        </label>
        <input
          type="url"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://example.com/target"
          className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
        />
      </div>

      {/* Alias */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
          Custom Alias Slug
        </label>
        <div className="flex items-center h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-xs text-on-surface-variant select-none">
            linkly.app/
          </span>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="vanity-slug"
            className="w-full bg-transparent font-mono text-xs font-bold text-primary focus:outline-none ml-1"
          />
        </div>
      </div>

      {/* Expiration Date/Time */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
          Expiration Timestamp (Optional)
        </label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:border-primary-container focus:outline-none transition-all"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
              <EditIcon size={18} />
            </div>
            <h3 className="font-bold text-base text-on-surface">Edit Link Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
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
