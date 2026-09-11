"use client";

import React, { useEffect, useState } from "react";
import { fetchUrlQrCode, QrCodeResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              qr_code_2
            </span>
            <h3 className="font-bold text-sm text-on-surface">Dynamic QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* QR Display */}
        <div className="py-6 flex flex-col items-center">
          {loading ? (
            <div className="w-56 h-56 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center gap-2 text-outline">
              <span className="material-symbols-outlined text-[28px] animate-spin text-primary">
                sync
              </span>
              <span className="text-xs">Generating vector QR...</span>
            </div>
          ) : qrData ? (
            <div className="p-4 rounded-2xl bg-white border border-outline-variant/50 shadow-inner inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrData.qrCode}
                alt={`QR code for ${shortCode}`}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="w-56 h-56 rounded-2xl bg-surface-container-low flex items-center justify-center text-xs text-error">
              Failed to generate QR code
            </div>
          )}

          <div className="mt-4">
            <span className="font-mono text-xs font-bold text-primary">
              linkly.app/{shortCode}
            </span>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Scans automatically route through edge telemetry
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/30">
          <button
            onClick={handleCopy}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied" : "Copy URL"}</span>
          </button>

          <button
            onClick={handleDownload}
            type="button"
            disabled={!qrData}
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
