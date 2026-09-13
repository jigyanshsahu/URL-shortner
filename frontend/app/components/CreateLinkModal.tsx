"use client";

import React, { useState } from "react";
import { createShortUrl, isValidUrl, ShortenedUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  LinkIcon,
  CloseIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  QrCodeIcon,
  PlusIcon,
  ErrorIcon,
  BoltIcon,
  RefreshIcon,
} from "./Icons";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={() => {
          handleReset();
          onClose();
        }}
      />
      <div className="relative w-full max-w-lg bg-[#0e0e12] rounded-2xl border border-white/10 shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <LinkIcon size={20} />
              </div>
              <h3 className="font-semibold text-lg text-zinc-100">
                Create Short Link
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Deploy a high-performance redirect on Linkly&apos;s global edge network.
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            type="button"
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 ring-4 ring-emerald-500/10">
              <CheckCircleIcon size={26} />
            </div>
            <h4 className="font-semibold text-base text-zinc-100">
              Link Created Successfully!
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-sm">
              Your link is active with sub-10ms Anycast routing.
            </p>

            <div className="w-full mt-5 p-3.5 rounded-xl bg-[#14141a] border border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-indigo-400 truncate select-all">
                {successResult.shortUrl}
              </span>
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition-all shrink-0 active:scale-95"
              >
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
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
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-white/10 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <QrCodeIcon size={18} />
                  <span>View QR Code</span>
                </button>
              )}
              <button
                onClick={handleReset}
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition-colors"
              >
                <PlusIcon size={18} />
                <span>Create Another</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="pt-4 flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <ErrorIcon size={18} className="text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Destination URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Destination URL *</span>
                <span className="text-[11px] text-zinc-500 font-normal">HTTP / HTTPS</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 pointer-events-none text-zinc-500">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/long-page-path?utm=campaign"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#14141a] border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/80 focus:bg-[#181822] focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Custom Alias */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Custom Alias (Optional)</span>
                <span className="text-[11px] text-zinc-500 font-normal">Leave blank for random</span>
              </label>
              <div className="flex items-center h-10 rounded-xl bg-[#14141a] border border-white/10 px-3 focus-within:border-indigo-500/80 transition-all">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Custom slug (optional, e.g. campaign)"
                  className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Expiration Policy */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Expiration Policy
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#14141a] border border-white/10 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="0" className="bg-zinc-900 text-zinc-200">Never Expire (Permanent)</option>
                <option value="1" className="bg-zinc-900 text-zinc-200">1 Day (24 Hours)</option>
                <option value="7" className="bg-zinc-900 text-zinc-200">7 Days (1 Week)</option>
                <option value="30" className="bg-zinc-900 text-zinc-200">30 Days (1 Month)</option>
                <option value="90" className="bg-zinc-900 text-zinc-200">90 Days (Quarterly)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {isLoading ? (
                  <RefreshIcon size={18} className="animate-spin" />
                ) : (
                  <BoltIcon size={18} />
                )}
                <span>{isLoading ? "Deploying..." : "Create Short Link"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
