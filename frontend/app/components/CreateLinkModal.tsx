"use client";

import React, { useState } from "react";
import { createShortUrl, isValidUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (createdUrl?: ShortenedUrl) => void;
  onOpenQr?: (shortCode: string, id: string | number) => void;
}

export default function CreateLinkModal({
  isOpen,
  onClose,
  onCreated,
  onOpenQr,
}: CreateLinkModalProps) {
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    shortUrl: string;
    shortCode: string;
    id?: string | number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please provide a destination URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);

    try {
      let expiresAt: string | undefined;
      const days = parseInt(expiryDays, 10);
      if (days > 0) {
        const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        expiresAt = exp.toISOString();
      }

      const res = await createShortUrl(url, {
        alias: alias.trim() || undefined,
        expiresAt,
        token,
      });

      setSuccessResult({
        shortUrl: res.shortUrl,
        shortCode: res.shortCode || alias || "short",
        id: res.id,
      });

      onCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create short link";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!successResult) return;
    navigator.clipboard.writeText(successResult.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUrl("");
    setAlias("");
    setExpiryDays("0");
    setSuccessResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={() => {
          handleReset();
          onClose();
        }}
      />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-container/10 text-primary-container">
                <span className="material-symbols-outlined text-[20px]">add_link</span>
              </div>
              <h3 className="font-semibold text-lg text-on-surface">
                Create Short Link
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Deploy a high-performance redirect on Linkly&apos;s global edge network.
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-tertiary-container/15 text-tertiary-container flex items-center justify-center mb-3 ring-4 ring-tertiary-container/10">
              <span className="material-symbols-outlined text-[26px]">check_circle</span>
            </div>
            <h4 className="font-semibold text-base text-on-surface">
              Link Created Successfully!
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5 max-w-sm">
              Your link is active with sub-10ms Anycast routing.
            </p>

            <div className="w-full mt-5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-primary truncate select-all">
                {successResult.shortUrl}
              </span>
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-medium hover:bg-primary transition-all shrink-0 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mt-6 w-full">
              {onOpenQr && successResult.id && (
                <button
                  onClick={() => {
                    onOpenQr(successResult.shortCode, successResult.id!);
                    onClose();
                  }}
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  <span>View QR Code</span>
                </button>
              )}
              <button
                onClick={handleReset}
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-xs font-medium hover:bg-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Create Another</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="pt-4 flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error-container text-on-error-container text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Destination URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant flex items-center justify-between">
                <span>Destination URL *</span>
                <span className="text-[11px] text-outline font-normal">HTTP / HTTPS</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                  link
                </span>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/long-page-path?utm=campaign"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Custom Alias */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant flex items-center justify-between">
                <span>Custom Alias (Optional)</span>
                <span className="text-[11px] text-outline font-normal">Leave blank for random</span>
              </label>
              <div className="flex items-center h-10 rounded-xl bg-surface-container-low border border-outline-variant/30 px-3 gap-1">
                <span className="font-mono text-xs text-on-surface-variant select-none">
                  linkly.app/
                </span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-campaign"
                  className="w-full bg-transparent font-mono text-xs font-semibold text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Expiration Policy */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">
                Expiration Policy
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:border-primary-container focus:outline-none transition-all"
              >
                <option value="0">Never Expire (Permanent)</option>
                <option value="1">1 Day (24 Hours)</option>
                <option value="7">7 Days (1 Week)</option>
                <option value="30">30 Days (1 Month)</option>
                <option value="90">90 Days (Quarterly)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-xs disabled:opacity-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isLoading ? "sync" : "bolt"}
                </span>
                <span>{isLoading ? "Deploying..." : "Create Short Link"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
