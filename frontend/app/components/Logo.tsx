import React from "react";
import Link from "next/link";

interface LogoProps {
  showBadge?: boolean;
  badgeText?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Logo({
  showBadge = false,
  badgeText = "v2.4.0-edge",
  size = "md",
  href = "/",
  className = "",
}: LogoProps) {
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }[size];

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Linkly Logo SVG Mark */}
      <svg
        className={`${iconDimensions} shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm shadow-primary-container/20`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#4F46E5" />
        <path
          d="M16 28L21 23C23.2091 20.7909 26.7909 20.7909 29 23L32 26"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 20L27 25C24.7909 27.2091 21.2091 27.2091 19 25L16 22"
          stroke="#C7D2FE"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="22" r="2.75" fill="white" />
        <circle cx="32" cy="26" r="2.75" fill="white" />
      </svg>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-semibold tracking-tight text-on-surface ${textSizes} leading-none`}
          >
            Linkly
          </span>
          {showBadge && (
            <span className="font-mono text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-primary leading-none">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
