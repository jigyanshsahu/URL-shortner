"use client";

import React, { useEffect, useState } from "react";
import { fetchUrlQrCode, QrCodeResponse, getShortUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  QrCodeIcon,
  CloseIcon,
  RefreshIcon,
  CheckIcon,
  CopyIcon,
} from "./Icons";

interface QrModalProps {
  urlId: string | number | null;
  shortCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrModal({
  urlId,
  shortCode,
  isOpen,
  onClose,
}: QrModalProps) {
  const { token } = useAuth();
  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !urlId) return;

    let isSubscribed = true;
    fetchUrlQrCode(urlId, token, shortCode)
      .then((res) => {
        if (isSubscribed) {
          setQrData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error("Failed to load QR code:", err);
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, urlId, shortCode, token]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!qrData?.shortUrl) return;
    navigator.clipboard.writeText(qrData.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrData?.qrCode) return;
    const a = document.createElement("a");
    a.href = qrData.qrCode;
    a.download = `linkly-qr-${shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-[#0e0e12] rounded-2xl border border-white/10 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <QrCodeIcon size={18} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Dynamic QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* QR Display */}
        <div className="py-6 flex flex-col items-center">
          {loading ? (
            <div className="w-56 h-56 rounded-2xl bg-[#14141a] border border-white/5 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <RefreshIcon size={28} className="animate-spin text-indigo-400" />
              <span className="text-xs">Generating vector QR...</span>
            </div>
          ) : qrData ? (
            <div className="p-4 rounded-2xl bg-white border border-white/10 shadow-md inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrData.qrCode}
                alt={`QR code for ${shortCode}`}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="w-56 h-56 rounded-2xl bg-[#14141a] border border-red-500/20 flex items-center justify-center text-xs text-red-400">
              Failed to generate QR code
            </div>
          )}

          <div className="mt-4 max-w-full px-2">
            <span className="font-mono text-xs font-bold text-indigo-400 truncate block select-all">
              {qrData?.shortUrl || getShortUrl(shortCode)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08]">
          <button
            onClick={handleCopy}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            <span>{copied ? "Copied" : "Copy URL"}</span>
          </button>

          <button
            onClick={handleDownload}
            type="button"
            disabled={!qrData}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 transition-colors disabled:opacity-50"
          >
            <QrCodeIcon size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
