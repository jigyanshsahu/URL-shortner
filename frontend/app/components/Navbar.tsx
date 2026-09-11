"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 transition-all">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-8">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
            <a
              href="#shortener"
              className="hover:text-on-surface transition-colors"
            >
              Shortener
            </a>
            <a
              href="#features"
              className="hover:text-on-surface transition-colors"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="hover:text-on-surface transition-colors"
            >
              Architecture
            </a>
            <Link
              href="/dashboard"
              className="hover:text-on-surface transition-colors flex items-center gap-1"
            >
              <span>Console</span>
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-surface-container-high text-primary font-semibold">
                Live
              </span>
            </Link>
          </nav>
        </div>

        {/* Right side CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-primary bg-primary-container hover:bg-primary px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Dashboard ({user?.name || "Jigyansh"})</span>
              </Link>
              <button
                onClick={logout}
                type="button"
                className="text-xs text-on-surface-variant hover:text-error transition-colors px-2 py-1"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-primary bg-primary-container hover:bg-primary px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <span>Launch Console</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          className="sm:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-6 py-4 bg-surface border-b border-outline-variant/30 flex flex-col gap-3">
          <a
            href="#shortener"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Shortener
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Features
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Architecture
          </a>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Dashboard Console
          </Link>
          <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-error font-medium"
              >
                Sign out ({user?.name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-primary"
              >
                Sign In / Demo
              </Link>
            )}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-container text-on-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}