"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070709] pt-16 pb-12 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/[0.08]">
          {/* Brand & Mission */}
          <div className="max-w-sm">
            <Logo size="md" href="/" />
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Ultra-scalable URL shortener, sub-10ms Anycast redirects, in-memory Redis caching, and real-time telemetry analytics for modern tech teams.
            </p>
          </div>

          {/* Operational Status indicator */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0e0e12]/80 px-4 py-3 shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-100">Global Edge Status: Optimal</p>
              <p className="text-[10px] text-zinc-400 font-mono">Redis & BullMQ Active (p99: 8.2ms)</p>
            </div>
          </div>
        </div>

        {/* Links & Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Linkly Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium text-zinc-400">
            <a href="#shortener" className="hover:text-zinc-100 transition-colors">
              Shortener
            </a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
            <Link href="/login" className="hover:text-zinc-100 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}