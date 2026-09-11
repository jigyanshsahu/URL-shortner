"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";

export default function ArchitectureFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: 1,
      title: "1. Incoming Request",
      sub: "Edge DNS / Anycast Gateway",
      desc: "Client visits linkly.app/turbo-v2. The closest Edge node receives the request with IP & Referrer headers.",
      badge: "< 4ms",
      icon: "public",
    },
    {
      id: 2,
      title: "2. Redis RAM Cache",
      sub: "Sub-millisecond Hash Lookup",
      desc: "Redis checks cache key url:turbo-v2. If present (Cache Hit), destination URL is fetched in microseconds.",
      badge: "0.8ms HIT",
      icon: "memory",
    },
    {
      id: 3,
      title: "3. BullMQ Telemetry Queue",
      sub: "Decoupled Click Worker",
      desc: "Click telemetry payload is pushed to an asynchronous Redis queue without waiting or delaying the redirect.",
      badge: "Async 0ms",
      icon: "swap_calls",
    },
    {
      id: 4,
      title: "4. PostgreSQL Storage",
      sub: "Persistent Database",
      desc: "Background worker batch-inserts click metrics and services database queries for URL management.",
      badge: "ACID Safe",
      icon: "database",
    },
    {
      id: 5,
      title: "5. HTTP 302 Found",
      sub: "Instant User Redirect",
      desc: "Client browser receives instant 302 response and is seamlessly redirected to the target destination.",
      badge: "Total: 8ms",
      icon: "rocket_launch",
    },
  ];

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const cards = containerRef.current?.querySelectorAll(".arch-step-card");
    if (!cards || cards.length === 0) {
      setIsSimulating(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsSimulating(false);
        setActiveStep(null);
      },
    });

    cards.forEach((card, index) => {
      tl.to(card, {
        scale: 1.03,
        borderColor: "#4F46E5",
        boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.2)",
        duration: 0.35,
        onStart: () => setActiveStep(index + 1),
      }).to(card, {
        scale: 1,
        borderColor: "rgba(199, 196, 216, 0.4)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        duration: 0.25,
      });
    });
  };

  return (
    <section
      id="architecture"
      ref={containerRef}
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-surface-container-high">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-3">
            Sub-millisecond Telemetry Pipeline
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl">
            See how Linkly decouples redirect latency from analytics logging using Redis RAM caching and asynchronous queue workers.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSimulating ? "sync" : "play_circle"}
          </span>
          <span>{isSimulating ? "Simulating Packet Flow..." : "Simulate Live Traffic"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`arch-step-card relative p-5 rounded-2xl bg-surface-container-lowest border transition-all flex flex-col justify-between ${
                isActive
                  ? "border-primary-container shadow-md bg-surface-container-low"
                  : "border-outline-variant/40 shadow-xs hover:border-outline-variant"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">
                      {step.icon}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">
                    {step.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-on-surface">{step.title}</h4>
                <div className="text-[11px] font-semibold text-primary mt-0.5">
                  {step.sub}
                </div>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-[11px] font-mono text-outline">
                <span>HOP #{step.id}</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
