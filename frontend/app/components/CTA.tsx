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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-primary to-secondary p-8 sm:p-14 text-center shadow-xl text-on-primary">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-surface-container-lowest/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/15 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-medium text-on-primary mb-6">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
            <span>INSTANT SETUP • ZERO DEPENDENCIES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-on-primary leading-tight">
            Accelerate your link infrastructure today
          </h2>

          <p className="mt-4 text-sm sm:text-base text-on-primary-container leading-relaxed">
            Gain complete visibility over every click, QR code scan, and user redirect with sub-10ms global edge delivery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#shortener"
              className="w-full sm:w-auto rounded-xl bg-surface-container-lowest text-primary px-7 py-3 text-xs font-bold shadow-md hover:bg-surface-container-low transition active:scale-98"
            >
              Shorten a Link Free
            </a>

            {!showAuth ? (
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl border border-on-primary/30 bg-on-primary/10 px-7 py-3 text-xs font-bold text-on-primary hover:bg-on-primary/20 transition"
              >
                Create Free Account
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl border border-on-primary/30 bg-on-primary/10 px-7 py-3 text-xs font-bold text-on-primary hover:bg-on-primary/20 transition"
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