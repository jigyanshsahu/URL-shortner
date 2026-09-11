"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface DonutDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface D3DonutChartProps {
  data: DonutDataPoint[];
  size?: number;
  innerRadiusRatio?: number;
}

const DEFAULT_COLORS = [
  "#4F46E5", // Primary Indigo
  "#6063EE", // Secondary Indigo
  "#006E4B", // Tertiary Emerald
  "#E11D48", // Rose
  "#D97706", // Amber
  "#0284C7", // Sky
];

export default function D3DonutChart({
  data,
  size = 220,
  innerRadiusRatio = 0.65,
}: D3DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeItem, setActiveItem] = useState<DonutDataPoint | null>(null);

  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = size / 2;
    const innerRadius = radius * innerRadiusRatio;

    svg
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("width", size)
      .attr("height", size);

    const g = svg
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    // Pie generator
    const pie = d3
      .pie<DonutDataPoint>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.04);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<DonutDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 6)
      .cornerRadius(4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<DonutDataPoint>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius)
      .cornerRadius(5);

    // Color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.label))
      .range(data.map((d, i) => d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]));

    // Arcs group
    const pathGroup = g.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc");

    const paths = pathGroup
      .append("path")
      .attr("fill", (d) => colorScale(d.data.label))
      .attr("d", arc)
      .style("cursor", "pointer")
      .attr("stroke", "transparent")
      .attr("stroke-width", 2);

    // Initial transition animation
    paths
      .transition()
      .duration(750)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || "";
        };
      });

    // Hover interactions
    paths
      .on("mouseenter", function (_, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", hoverArc as any)
          .attr("opacity", 1);

        setActiveItem(d.data);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", arc as any)
          .attr("opacity", 0.95);

        setActiveItem(null);
      });
  }, [data, size, innerRadiusRatio]);

  const displayItem = activeItem || {
    label: "Total Clicks",
    value: total,
    color: "#4F46E5",
  };

  const displayPct = total > 0 ? Math.round((displayItem.value / total) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* Donut graphic with center text */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg ref={svgRef} className="overflow-visible" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-[11px] font-mono text-outline font-semibold uppercase tracking-wider truncate max-w-[120px]">
            {activeItem ? activeItem.label : "Total Traffic"}
          </span>
          <span className="text-xl font-extrabold text-on-surface font-mono tracking-tight mt-0.5">
            {displayItem.value.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono font-bold text-primary">
            {activeItem ? `${displayPct}% of traffic` : `${data.length} sources`}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {data.map((item, idx) => {
          const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const isCurrentActive = activeItem?.label === item.label;

          return (
            <div
              key={idx}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isCurrentActive
                  ? "bg-surface-container-high scale-[1.02] shadow-xs"
                  : "hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-on-surface truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <span className="text-on-surface-variant font-semibold">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-outline text-[11px] font-medium w-9 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
