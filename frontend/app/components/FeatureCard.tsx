interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export default function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="flex items-center justify-between mb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl group-hover:bg-zinc-700 transition">
          {icon}
        </span>
        {badge && (
          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
    </div>
  );
}