import * as React from "react";

export type IconName =
  | "shield"
  | "check"
  | "arrowRight"
  | "arrowUpRight"
  | "sparkle"
  | "paste"
  | "upload"
  | "image"
  | "link"
  | "msg"
  | "camera"
  | "lock"
  | "eye"
  | "fingerprint"
  | "flag"
  | "copy"
  | "bookmark"
  | "chevronDown"
  | "chevronRight"
  | "plus"
  | "minus"
  | "x"
  | "alert"
  | "cards"
  | "coin"
  | "bolt"
  | "globe"
  | "radar"
  | "star"
  | "sun"
  | "moon"
  | "filter"
  | "file"
  | "refresh"
  | "play"
  | "menu";

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const PATHS: Record<IconName, React.ReactNode> = {
  shield: (
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  arrowUpRight: (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7L19 14z" />
    </>
  ),
  paste: (
    <>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <rect x="5" y="5" width="14" height="16" rx="2" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  msg: <path d="M21 12a8 8 0 1 1-3-6.2L21 4l-1 4 1 0 0 4z" />,
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M12 4a8 8 0 0 0-8 8c0 1 .2 2 .5 3" />
      <path d="M20 12a8 8 0 0 0-8-8c-1 0-2 .2-3 .5" />
      <path d="M8 18c.6 1.4 1.6 2.6 3 3.5" />
      <path d="M12 8a4 4 0 0 0-4 4c0 2 .5 4 1.5 5.5" />
      <path d="M16 12a4 4 0 0 0-1.2-2.9" />
      <path d="M12 12v3c0 1.5.5 3 1.5 4" />
    </>
  ),
  flag: <path d="M4 21V4h12l-2 4 2 4H4" />,
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l10 18H2L12 3z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="6" width="14" height="11" rx="2" />
      <rect x="7" y="3" width="14" height="11" rx="2" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6M12 9v6" />
    </>
  ),
  bolt: <polygon points="13 2 4 14 11 14 11 22 20 10 13 10 13 2" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12L19 8" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  star: <polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />,
  filter: <polygon points="3 4 21 4 14 13 14 20 10 20 10 13 3 4" />,
  file: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="14 3 14 9 20 9" />
    </>
  ),
  refresh: (
    <>
      <polyline points="3 12 6 9 9 12" />
      <path d="M6 9v6a6 6 0 0 0 12 0" />
      <polyline points="21 12 18 15 15 12" />
      <path d="M18 15V9a6 6 0 0 0-12 0" />
    </>
  ),
  play: <polygon points="6 4 20 12 6 20 6 4" />,
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
  ...rest
}: IconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export default Icon;
