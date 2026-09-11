"use client";

import React, { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import {
  PublicIcon,
  MemoryIcon,
  QueueIcon,
  DatabaseIcon,
  RocketIcon,
  PlayIcon,
  RefreshIcon,
  ArrowRightIcon,
} from "./Icons";

interface FlowStep {
  id: number;
  title: string;
  sub: string;
  desc: string;
  badge: string;
  icon: string;
}

const steps: FlowStep[] = [
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

export default function ArchitectureFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render D3 SVG connector pipeline
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 140;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");

    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).enter().append("feMergeNode").attr("in", (d) => d);

    // Connector gradient
    const linkGradient = defs
      .append("linearGradient")
      .attr("id", "flow-link-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linkGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4F46E5").attr("stop-opacity", 0.6);
    linkGradient.append("stop").attr("offset", "50%").attr("stop-color", "#818CF8").attr("stop-opacity", 0.9);
    linkGradient.append("stop").attr("offset", "100%").attr("stop-color", "#4F46E5").attr("stop-opacity", 0.6);

    // 5 Node coordinates along width
    const nodeCoords = [
      { x: 100, y: 70, id: 1, label: "Edge Gateway" },
      { x: 300, y: 70, id: 2, label: "Redis RAM" },
      { x: 500, y: 70, id: 3, label: "BullMQ Queue" },
      { x: 700, y: 70, id: 4, label: "Postgres DB" },
      { x: 900, y: 70, id: 5, label: "HTTP 302" },
    ];

    const linkGroup = svg.append("g").attr("class", "links");

    // Draw connecting paths between adjacent nodes
    for (let i = 0; i < nodeCoords.length - 1; i++) {
      const start = nodeCoords[i];
      const end = nodeCoords[i + 1];

      // Base track
      linkGroup
        .append("path")
        .attr("d", `M ${start.x} ${start.y} L ${end.x} ${end.y}`)
        .attr("stroke", "#C7C4D8")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-opacity", 0.4);

      // Active pulse track
      linkGroup
        .append("path")
        .attr("id", `link-path-${i + 1}`)
        .attr("d", `M ${start.x} ${start.y} L ${end.x} ${end.y}`)
        .attr("stroke", "url(#flow-link-gradient)")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-opacity", 0.85);
    }

    // Node circles & rings
    const nodeGroup = svg.append("g").attr("class", "nodes");

    nodeCoords.forEach((node) => {
      const gNode = nodeGroup
        .append("g")
        .attr("id", `d3-node-${node.id}`)
        .attr("class", "cursor-pointer transition-transform duration-200")
        .attr("transform", `translate(${node.x}, ${node.y})`);

      // Outer pulse ring
      gNode
        .append("circle")
        .attr("r", 28)
        .attr("fill", "transparent")
        .attr("stroke", "#4F46E5")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.3)
        .attr("class", "node-outer-ring");

      // Inner solid node
      gNode
        .append("circle")
        .attr("r", 20)
        .attr("fill", "#FAF8FF")
        .attr("stroke", "#4F46E5")
        .attr("stroke-width", 2.5)
        .attr("class", "node-circle shadow-md");

      // Center index text
      gNode
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("class", "font-mono font-bold text-xs")
        .attr("fill", "#4F46E5")
        .text(`0${node.id}`);

      // Node label
      gNode
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 38)
        .attr("class", "font-sans font-semibold text-[11px]")
        .attr("fill", "#131B2E")
        .text(node.label);

      // Interactivity
      gNode.on("mouseenter", function () {
        d3.select(this)
          .select(".node-circle")
          .attr("fill", "#4F46E5");
        d3.select(this)
          .select("text")
          .attr("fill", "#FFFFFF");
        setActiveStep(node.id);
      });

      gNode.on("mouseleave", function () {
        d3.select(this)
          .select(".node-circle")
          .attr("fill", "#FAF8FF");
        d3.select(this)
          .select("text")
          .attr("fill", "#4F46E5");
        setActiveStep(null);
      });
    });
  }, []);

  // Animate D3 packet flow when simulate button is pressed
  const handleSimulate = () => {
    if (isSimulating || !svgRef.current) return;
    setIsSimulating(true);

    const svg = d3.select(svgRef.current);
    const nodeCoords = [
      { x: 100, y: 70, id: 1 },
      { x: 300, y: 70, id: 2 },
      { x: 500, y: 70, id: 3 },
      { x: 700, y: 70, id: 4 },
      { x: 900, y: 70, id: 5 },
    ];

    // Remove any previous flying packets
    svg.selectAll(".flying-packet").remove();

    // Create glowing packet
    const packet = svg
      .append("circle")
      .attr("class", "flying-packet")
      .attr("r", 9)
      .attr("cx", nodeCoords[0].x)
      .attr("cy", nodeCoords[0].y)
      .attr("fill", "#4F46E5")
      .attr("filter", "url(#glow)")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2);

    let currentHop = 0;

    function animateNextHop() {
      if (currentHop >= nodeCoords.length - 1) {
        // Finished simulation
        packet
          .transition()
          .duration(300)
          .attr("r", 18)
          .attr("opacity", 0)
          .remove();

        setTimeout(() => {
          setIsSimulating(false);
          setActiveStep(null);
        }, 400);
        return;
      }

      const nextHop = currentHop + 1;
      const target = nodeCoords[nextHop];
      setActiveStep(nextHop + 1);

      // Node pulse effect on arrival
      d3.select(`#d3-node-${nextHop + 1}`)
        .select(".node-outer-ring")
        .transition()
        .duration(200)
        .attr("r", 36)
        .attr("stroke-opacity", 0.9)
        .transition()
        .duration(300)
        .attr("r", 28)
        .attr("stroke-opacity", 0.3);

      packet
        .transition()
        .duration(450)
        .ease(d3.easeCubicInOut)
        .attr("cx", target.x)
        .attr("cy", target.y)
        .on("end", () => {
          currentHop++;
          animateNextHop();
        });
    }

    setActiveStep(1);
    animateNextHop();
  };

  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case "public":
        return <PublicIcon size={18} />;
      case "memory":
        return <MemoryIcon size={18} />;
      case "swap_calls":
        return <QueueIcon size={18} />;
      case "database":
        return <DatabaseIcon size={18} />;
      case "rocket_launch":
        return <RocketIcon size={18} />;
      default:
        return <PublicIcon size={18} />;
    }
  };

  return (
    <section
      id="architecture"
      ref={containerRef}
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-surface-container-high">
            D3.JS TELEMETRY ENGINE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-3">
            Sub-millisecond Telemetry Pipeline
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl">
            Interactive D3.js vector pipeline illustrating how Linkly decouples redirect latency from analytics logging using Redis RAM caching and asynchronous queue workers.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          {isSimulating ? (
            <RefreshIcon size={18} className="animate-spin" />
          ) : (
            <PlayIcon size={18} />
          )}
          <span>{isSimulating ? "Simulating Packet Flow..." : "Simulate Live Traffic"}</span>
        </button>
      </div>

      {/* D3.js Animated Vector Pipeline (Hidden on mobile, rich on sm+) */}
      <div className="hidden sm:block w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-4 mb-6 shadow-xs overflow-hidden">
        <div className="w-full max-w-4xl mx-auto h-[140px]">
          <svg ref={svgRef} className="w-full h-full select-none" />
        </div>
      </div>

      {/* 5 Architecture Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`arch-step-card relative p-5 rounded-2xl bg-surface-container-lowest border transition-all flex flex-col justify-between ${
                isActive
                  ? "border-primary-container shadow-md bg-surface-container-low scale-[1.02]"
                  : "border-outline-variant/40 shadow-xs hover:border-outline-variant"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    {renderStepIcon(step.icon)}
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
                <ArrowRightIcon size={14} className="text-primary" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
