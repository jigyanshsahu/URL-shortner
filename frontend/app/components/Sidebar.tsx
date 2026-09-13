"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import {
  GridIcon,
  LinkIcon,
  InsightsIcon,
  PlusIcon,
  LogOutIcon,
  CloseIcon,
  MenuIcon,
} from "./Icons";

interface SidebarProps {
  onOpenCreateModal?: () => void;
}

export default function Sidebar({ onOpenCreateModal }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "grid_view" },
    { name: "My Links", href: "/links", icon: "link" },
    { name: "Analytics", href: "/analytics", icon: "insights" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const renderNavIcon = (iconName: string, isActive: boolean) => {
    const className = isActive ? "text-on-primary" : "text-on-surface-variant";
    switch (iconName) {
      case "grid_view":
        return <GridIcon size={20} className={className} />;
      case "link":
        return <LinkIcon size={20} className={className} />;
      case "insights":
        return <InsightsIcon size={20} className={className} />;
      default:
        return <LinkIcon size={20} className={className} />;
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="px-2">
          <Logo size="md" href="/dashboard" />
        </div>

        {/* Action Button */}
        {onOpenCreateModal && (
          <button
            onClick={() => {
              onOpenCreateModal();
              setMobileOpen(false);
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 transition-all active:scale-[0.98]"
          >
            <PlusIcon size={18} />
            <span>Create Short Link</span>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-xs"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {renderNavIcon(item.icon, isActive)}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout footer */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-sm ring-1 ring-indigo-500/30 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-100 truncate">
                {user?.name || "Developer"}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                Free Developer Tier
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            title="Log out"
            className="p-1.5 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOutIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#09090b] border-r border-white/[0.08] z-40 flex-col">
        {navContent}
      </aside>

      {/* Mobile Top Navbar Bar with Drawer Trigger */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.08]">
        <Logo size="sm" href="/dashboard" />
        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs"
              type="button"
            >
              <PlusIcon size={20} />
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800"
            type="button"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[#09090b] border-r border-white/10 shadow-2xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
