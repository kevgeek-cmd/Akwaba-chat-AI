import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon Container with Elephant Symbol */}
      <div
        className={`${iconSizes[size]} flex items-center justify-center rounded-2xl bg-linear-to-br from-akwaba-green to-akwaba-green-hover text-white shadow-md shadow-emerald-900/10 transition-transform duration-200 hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
        >
          {/* Elephant Silhouette SVG */}
          <path d="M12 4c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.3 5.7L6 20h3l.7-2.3c.7.2 1.5.3 2.3.3 4.4 0 8-3.6 8-8s-3.6-8-8-8z" />
          <path d="M15 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M9 16c0 1.5-1 3-3 3" />
        </svg>
      </div>

      {/* App Name */}
      {showText && (
        <span className={`${textSizes[size]} font-bold tracking-tight flex items-center gap-1`}>
          <span className="text-akwaba-green">Akwaba</span>
          <span className="text-akwaba-orange">Chat</span>
        </span>
      )}
    </div>
  );
}
