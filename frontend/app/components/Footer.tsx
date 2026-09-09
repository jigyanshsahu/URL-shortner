import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 text-xs font-black text-white">
              S
            </span>
            <span className="text-lg font-bold text-white">Shortly</span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#shortener" className="hover:text-white transition">
              Shortener
            </a>
            <a href="#analytics" className="hover:text-white transition">
              Analytics
            </a>
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Register
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Shortly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}