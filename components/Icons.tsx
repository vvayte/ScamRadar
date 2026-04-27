import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function CameraIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.2-1.6a1.5 1.5 0 0 1 1.2-.6h4.2a1.5 1.5 0 0 1 1.2.6L16.5 6h2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function UploadIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" />
    </svg>
  );
}

export function ScanIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M3 7V5.5A2.5 2.5 0 0 1 5.5 3H7" />
      <path d="M21 7V5.5A2.5 2.5 0 0 0 18.5 3H17" />
      <path d="M3 17v1.5A2.5 2.5 0 0 0 5.5 21H7" />
      <path d="M21 17v1.5A2.5 2.5 0 0 1 18.5 21H17" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function ShieldIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function AlertIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function CloseIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function BoltIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CopyIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </svg>
  );
}

export function ChatIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M21 12a8 8 0 0 1-8 8 8 8 0 0 1-3.6-.9L4 21l1.2-4.4A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function FileIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function GlobeIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function ClockIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function RadarIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12 19 5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function StarIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17.8 6.5 20l1-6.1L3 9.5l6.3-.9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Animated radar sweep — used in logo and hero */
export function RadarSweep({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <defs>
        <linearGradient id="radar-sweep-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="radar-sweep-arc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" stroke="url(#radar-sweep-grad)" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="8" stroke="rgba(125,211,252,0.45)" strokeWidth="1" />
      <circle cx="16" cy="16" r="3.5" stroke="rgba(125,211,252,0.55)" strokeWidth="1" />
      <circle cx="16" cy="16" r="1.4" fill="#a5f3fc" />
      <g className="spin-slow" style={{ transformOrigin: "16px 16px" }}>
        <path d="M16 16 L16 3 A13 13 0 0 1 28.6 13 Z" fill="url(#radar-sweep-arc)" />
      </g>
    </svg>
  );
}
