import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-800/80 bg-zinc-950/60 py-24 sm:py-32">
      {/* Ambient background blur */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Ready to shorten your first link?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
          Create an account to manage your links, track custom analytics, and scale your brand.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-white/10 transition hover:bg-zinc-200"
          >
            Get Started Free →
          </Link>

          <a
            href="#shortener"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Try without account
          </a>
        </div>
      </div>
    </section>
  );
}