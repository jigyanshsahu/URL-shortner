"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { GridIcon, ArrowRightIcon, CloseIcon, MenuIcon } from "./Icons";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && isAuthenticated;

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
            {showAuth && (
              <Link
                href="/dashboard"
                className="hover:text-on-surface transition-colors flex items-center gap-1.5 font-semibold text-primary"
              >
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right side CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {showAuth ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-primary bg-primary-container hover:bg-primary px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <GridIcon size={18} />
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
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-primary bg-primary-container hover:bg-primary px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRightIcon size={16} />
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
          {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
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
          {showAuth && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Dashboard
            </Link>
          )}
          <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
            {showAuth ? (
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
              href={showAuth ? "/dashboard" : "/register"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-container text-on-primary"
            >
              {showAuth ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}