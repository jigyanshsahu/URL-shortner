"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface DataPoint {
  date: string;
  clicks: number;
}

interface D3TimelineChartProps {
  data: DataPoint[];
  height?: number;
  barColor?: string;
  highlightColor?: string;
}

export default function D3TimelineChart({
  data,
  height = 240,
  barColor = "#4F46E5",
  highlightColor = "#6366F1",
}: D3TimelineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    clicks: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: "",
    clicks: 0,
  });

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 35, left: 35 };
    const width = containerRef.current
      ? containerRef.current.clientWidth - margin.left - margin.right
      : 500;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Defs for gradients & filters
    const defs = svg.append("defs");

    // Bar gradient
    const gradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", highlightColor)
      .attr("stop-opacity", 0.95);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", barColor)
      .attr("stop-opacity", 0.7);

    // Area gradient
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", barColor)
      .attr("stop-opacity", 0.25);

    areaGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", barColor)
      .attr("stop-opacity", 0.0);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, width])
      .padding(0.35);

    const maxVal = d3.max(data, (d) => d.clicks) || 10;
    const y = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.2)])
      .range([innerHeight, 0]);

    // Horizontal Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group
          .selectAll("line")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.08)
          .attr("stroke-dasharray", "4,4")
      );

    // Smooth spline area behind bars
    const area = d3
      .area<DataPoint>()
      .x((d) => (x(d.date) || 0) + x.bandwidth() / 2)
      .y0(innerHeight)
      .y1((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Smooth spline line
    const line = d3
      .line<DataPoint>()
      .x((d) => (x(d.date) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", barColor)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0.5)
      .attr("d", line);

    // Bars
    const bars = g
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar transition-all duration-200")
      .attr("x", (d) => x(d.date) || 0)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("rx", 6)
      .attr("fill", "url(#bar-gradient)")
      .style("cursor", "pointer");

    // Animate bars entrance
    bars
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.clicks))
      .attr("height", (d) => innerHeight - y(d.clicks));

    // Hover interactions
    bars
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("fill", highlightColor)
          .attr("transform", "scale(1.03) translate(-1, -2)");

        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltip({
          visible: true,
          x: mX,
          y: mY - 45,
          date: d.date,
          clicks: d.clicks,
        });
      })
      .on("mousemove", function (event) {
        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltip((prev) => ({ ...prev, x: mX, y: mY - 45 }));
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("fill", "url(#bar-gradient)")
          .attr("transform", "scale(1) translate(0, 0)");

        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Value badges atop bars
    g.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label font-mono text-[10px] font-semibold")
      .attr("x", (d) => (x(d.date) || 0) + x.bandwidth() / 2)
      .attr("y", innerHeight)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("opacity", 0)
      .text((d) => d.clicks)
      .transition()
      .duration(700)
      .delay((_, i) => i * 60 + 200)
      .attr("y", (d) => y(d.clicks) - 6)
      .attr("opacity", 0.85);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
      .call((group) => group.select(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.15))
      .call((group) =>
        group
          .selectAll("text")
          .attr("class", "font-mono text-[11px] font-medium")
          .attr("fill", "currentColor")
          .attr("opacity", 0.7)
      );

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6))
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group
          .selectAll("text")
          .attr("class", "font-mono text-[10px]")
          .attr("fill", "currentColor")
          .attr("opacity", 0.6)
      );
  }, [data, height, barColor, highlightColor]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none">
      <svg ref={svgRef} className="w-full text-on-surface" />
      {tooltip.visible && (
        <div
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
          className="pointer-events-none absolute z-20 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl text-xs font-mono border border-outline-variant/30 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100"
        >
          <span className="font-semibold text-primary-fixed">{tooltip.date}:</span>
          <span className="font-bold text-white">{tooltip.clicks.toLocaleString()} clicks</span>
        </div>
      )}
    </div>
  );
}
