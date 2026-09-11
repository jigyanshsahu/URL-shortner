"use client";

import React from "react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-outline-variant/30">
          {/* Brand & Mission */}
          <div className="max-w-sm">
            <Logo size="md" showBadge badgeText="v2.4-edge" href="/" />
            <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">
              Ultra-scalable URL shortener, sub-10ms Anycast redirects, in-memory Redis caching, and real-time telemetry analytics for modern tech teams.
            </p>
          </div>

          {/* Operational Status indicator */}
          <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary-container" />
            </span>
            <div>
              <p className="text-xs font-bold text-on-surface">Global Edge Status: Optimal</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Redis & BullMQ Active (p99: 8.2ms)</p>
            </div>
          </div>
        </div>

        {/* Links & Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Linkly Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#shortener" className="hover:text-on-surface transition-colors">
              Shortener
            </a>
            <a href="#features" className="hover:text-on-surface transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-on-surface transition-colors">
              Architecture
            </a>
            <a href="/dashboard" className="text-primary hover:underline transition-colors">
              Console
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}