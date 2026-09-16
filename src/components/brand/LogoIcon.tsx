import type { CSSProperties } from "react";

type LogoIconProps = {
  className?: string;
  variant?: "color" | "white" | "mono";
  style?: CSSProperties;
};

/**
 * Placeholder brand mark — a graduation cap whose tassel swoops forward into
 * an arrow. Replace with the client's real logo files in /public/brand/ when
 * provided (see build prompt section 3 / open items).
 */
export function LogoIcon({ className, variant = "color", style }: LogoIconProps) {
  const cap = variant === "white" ? "#FFFFFF" : variant === "mono" ? "currentColor" : "#1C2B4A";
  const accent = variant === "white" ? "#FFFFFF" : variant === "mono" ? "currentColor" : "#C9973C";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label="Learn Being Forward logo mark"
    >
      <path
        d="M24 9 L42 16.5 L24 24 L6 16.5 Z"
        fill={cap}
      />
      <path
        d="M14 19.5 L14 27 C14 27 18 31.5 24 31.5 C30 31.5 34 27 34 27 L34 19.5 L24 23.5 Z"
        fill={cap}
        opacity={variant === "mono" ? 0.85 : 1}
      />
      <path
        d="M24 24 C25 28 27 31 31 33"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30.5 29 L35 33.5 L30 35.5"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
