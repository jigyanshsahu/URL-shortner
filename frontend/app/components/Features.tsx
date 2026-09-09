import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "⚡",
    title: "Lightning Redirects",
    description: "Built for speed. Optimized 302 HTTP redirects ensure sub-millisecond route resolution.",
    badge: "Fast",
  },
  {
    icon: "📊",
    title: "Live Click Analytics",
    description: "Track total clicks and engagement in real-time as users open your short links.",
    badge: "Real-time",
  },
  {
    icon: "🔀",
    title: "Smart Deduplication",
    description: "Automatically reuses existing short codes for identical URLs to save space and keep codes clean.",
    badge: "Intelligent",
  },
  {
    icon: "📱",
    title: "Instant QR Codes",
    description: "Generate scannable QR codes for your short links on the fly for printed media and mobile apps.",
    badge: "Convenient",
  },
  {
    icon: "🛡️",
    title: "Secure & Resilient",
    description: "SQL-injection safe parameterized queries and validated URLs keep your links safe.",
    badge: "Reliable",
  },
  {
    icon: "🚀",
    title: "Scalable Architecture",
    description: "Powered by Node.js, Express, and PostgreSQL designed to effortlessly handle high request throughput.",
    badge: "Scalable",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
          Features
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to scale your links.
        </h2>
        <p className="mt-3 text-sm text-zinc-400">
          Built with cutting-edge technologies to guarantee reliability, performance, and simplicity.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            badge={feature.badge}
          />
        ))}
      </div>
    </section>
  );
}