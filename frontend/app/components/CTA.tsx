"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function CTA() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && isAuthenticated;

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14141a] via-[#0e0e12] to-[#13112c] border border-white/10 p-8 sm:p-14 text-center shadow-2xl text-zinc-100">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-mono font-medium text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>INSTANT SETUP • ZERO DEPENDENCIES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Accelerate your link infrastructure today
          </h2>

          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Gain complete visibility over every click, QR code scan, and user redirect with sub-10ms global edge delivery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#shortener"
              className="w-full sm:w-auto rounded-xl bg-white text-zinc-950 px-7 py-3 text-xs font-bold shadow-lg hover:bg-zinc-200 transition active:scale-98"
            >
              Shorten a Link Free
            </a>

            {!showAuth ? (
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-zinc-800/80 px-7 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              >
                Create Free Account
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-zinc-800/80 px-7 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}