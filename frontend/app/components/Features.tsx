"use client";

import {
  BoltIcon,
  TagIcon,
  TimerIcon,
  InsightsIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "./Icons";

export default function Features() {
  const features = [
    {
      id: "bolt",
      renderIcon: () => <BoltIcon size={22} />,
      title: "Sub-10ms Edge Redirects",
      desc: "In-memory Redis layer ensures instantaneous lookups before hitting PostgreSQL, minimizing redirect latency across the globe.",
      tag: "PERFORMANCE",
    },
    {
      id: "branding",
      renderIcon: () => <TagIcon size={22} />,
      title: "Custom Vanity Aliases",
      desc: "Claim branded, memorable custom slugs for higher click-through rates and clean link sharing.",
      tag: "BRANDING",
    },
    {
      id: "timer",
      renderIcon: () => <TimerIcon size={22} />,
      title: "Automated Link Expiration",
      desc: "Schedule links to expire after 24h, 7 days, or specific dates. Background cron workers automatically invalidate dead links.",
      tag: "LIFECYCLE",
    },
    {
      id: "telemetry",
      renderIcon: () => <InsightsIcon size={22} />,
      title: "Real-Time Click Telemetry",
      desc: "Asynchronous BullMQ queues capture referrer, device, browser, and geo-data without adding latency to the user redirect.",
      tag: "TELEMETRY",
    },
    {
      id: "qr",
      renderIcon: () => <QrCodeIcon size={22} />,
      title: "Dynamic High-Res QR Codes",
      desc: "Instantly generate crisp SVG and PNG QR codes ready for marketing print, slides, or digital displays.",
      tag: "UTILITY",
    },
    {
      id: "security",
      renderIcon: () => <ShieldCheckIcon size={22} />,
      title: "Built-In Edge Rate Limiting",
      desc: "Sliding-window Redis rate-limiters prevent abuse and bot spam, safeguarding API reliability for production workloads.",
      tag: "SECURITY",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-bold px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          ENGINEERING ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight mt-4">
          Engineered for scale, speed, and precision
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 mt-3">
          Every component in Linkly is tuned to provide microsecond response times and high availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-2xl bg-[#0e0e12]/80 backdrop-blur-sm border border-white/10 hover:border-indigo-500/40 shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                  {item.renderIcon()}
                </div>
                <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-white/5">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <span className="group-hover:mr-1 transition-all">Explore spec</span>
              <ArrowRightIcon size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}