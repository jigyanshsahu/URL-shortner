"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { SearchIcon, PlusIcon } from "./Icons";

interface ConsoleHeaderProps {
  pageTitle: string;
  onOpenCreateModal?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export default function ConsoleHeader({
  pageTitle,
  onOpenCreateModal,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search links, tags, domains...",
}: ConsoleHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="hover:text-zinc-200 transition-colors cursor-pointer">
          Console
        </span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-100 font-semibold">{pageTitle}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {onSearchChange !== undefined && (
          <div className="relative hidden sm:flex items-center">
            <div className="absolute left-3 pointer-events-none text-zinc-500">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-60 md:w-72 h-9 pl-9 pr-12 rounded-xl bg-[#14141a] text-xs text-zinc-100 placeholder:text-zinc-500 border border-white/10 focus:border-indigo-500/80 focus:bg-[#181822] focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all"
            />
            <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 font-mono text-[10px] text-zinc-400">
              <span>⌘</span>K
            </div>
          </div>
        )}

        {/* Global Create Link Trigger */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 px-3.5 py-2 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all active:scale-[0.98]"
          >
            <PlusIcon size={18} />
            <span className="hidden xs:inline">Create Link</span>
          </button>
        )}

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-zinc-800 shrink-0 shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
        </div>
      </div>
    </header>
  );
}
