import React from "react";

interface LogoProps {
  className?: string;
  /** 'light' = white text (on dark bg), 'dark' = brand-navy text */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: "text-[18px]",
  md: "text-[22px]",
  lg: "text-[32px]",
};

export function Logo({
  className = "",
  variant = "dark",
  size = "md",
}: LogoProps) {
  const baseColor =
    variant === "light" ? "text-white" : "text-brand-navy";

  return (
    <span
      className={`font-serif tracking-[-0.02em] leading-none select-none ${SIZE[size]} ${baseColor} ${className}`}
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      St<span style={{ fontWeight: 800 }}>A</span>le.
    </span>
  );
}