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
        {/* Logo and edge tag */}
        <div className="px-2">
          <Logo size="md" showBadge badgeText="v2.4-edge" href="/dashboard" />
        </div>

        {/* Action Button */}
        {onOpenCreateModal && (
          <button
            onClick={() => {
              onOpenCreateModal();
              setMobileOpen(false);
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-container text-on-primary font-medium text-sm shadow-sm hover:bg-primary transition-all active:scale-[0.98]"
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
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
      <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-container/15 text-primary-container font-semibold flex items-center justify-center text-sm ring-1 ring-primary-container/25 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">
                {user?.name || "Jigyansh"}
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                Free Developer Tier
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            title="Log out"
            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant/30 z-40 flex-col">
        {navContent}
      </aside>

      {/* Mobile Top Navbar Bar with Drawer Trigger */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
        <Logo size="sm" showBadge badgeText="v2.4" href="/dashboard" />
        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="p-2 rounded-lg bg-primary-container text-on-primary"
              type="button"
            >
              <PlusIcon size={20} />
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
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
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-surface-container-low shadow-xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
