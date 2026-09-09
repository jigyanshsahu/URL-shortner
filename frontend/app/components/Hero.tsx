"use client";

import UrlShortener from "./UrlShortener";

interface HeroProps {
  onUrlCreated?: () => void;
}

export default function Hero({ onUrlCreated }: HeroProps) {
  function scrollToShortener() {
    const el = document.getElementById("shortener");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const input = el.querySelector("input");
      if (input) input.focus();
    }
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background glow accents */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 right-10 -z-10 h-72 w-72 rounded-full bg-cyan-600/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Headline & Pitch */}
          <div className="text-center lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md shadow-sm">
              <span className="text-amber-400">⚡</span>
              <span>Ultra-fast 302 redirects</span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400 font-semibold">PostgreSQL Powered</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
              Turn long URLs into{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                powerful short links.
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
              Create lightning-fast, branded short links and track every click in real-time with our
              scalable infrastructure.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <button
                type="button"
                onClick={scrollToShortener}
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition hover:bg-zinc-200"
              >
                Create your link
              </button>

              <a
                href="#features"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                Learn more ↓
              </a>
            </div>

            {/* Micro feature pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 lg:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Instant Shortening</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Click Tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>QR Code Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Shortener Widget (Visible across all devices!) */}
          <div className="w-full lg:col-span-6">
            <UrlShortener onUrlCreated={onUrlCreated} />
          </div>
        </div>
      </div>
    </section>
  );
}