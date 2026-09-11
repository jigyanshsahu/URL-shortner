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
    <header className="sticky top-0 z-30 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <span className="hover:text-on-surface transition-colors cursor-pointer">
          Console
        </span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-semibold">{pageTitle}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {onSearchChange !== undefined && (
          <div className="relative hidden sm:flex items-center">
            <div className="absolute left-3 pointer-events-none text-outline">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-60 md:w-72 h-9 pl-9 pr-12 rounded-xl bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
            />
            <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant">
              <span>⌘</span>K
            </div>
          </div>
        )}

        {/* Global Create Link Trigger */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-primary bg-primary-container hover:bg-primary px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <PlusIcon size={18} />
            <span className="hidden xs:inline">Create Link</span>
          </button>
        )}

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center ring-2 ring-surface-container-high shrink-0 shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
        </div>
      </div>
    </header>
  );
}
