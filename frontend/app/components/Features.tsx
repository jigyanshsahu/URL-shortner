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
      desc: "Claim branded, memorable slugs like linkly.app/launch for higher click-through rates and campaign brand consistency.",
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
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-surface-container-high">
          ENGINEERING ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-4">
          Engineered for scale, speed, and precision
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant mt-3">
          Every component in Linkly is tuned to provide microsecond response times and high availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary-container/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                  {item.renderIcon()}
                </div>
                <span className="font-mono text-[10px] font-bold tracking-wider text-outline px-2 py-0.5 rounded bg-surface-container-low">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center text-xs font-semibold text-primary">
              <span className="group-hover:mr-1 transition-all">Explore spec</span>
              <ArrowRightIcon size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}