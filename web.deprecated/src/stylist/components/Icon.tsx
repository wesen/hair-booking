import type { IconName } from "../types";

interface IconProps {
  name: IconName;
  size?: number;
}

const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Icon({ name, size = 20 }: IconProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "middle",
  };

  const content = getIconContent(name);
  if (!content) return null;

  return (
    <svg {...svgBase} style={style}>
      {content}
    </svg>
  );
}

function getIconContent(name: IconName): React.ReactNode {
  switch (name) {
    case "home":
      return (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x={3} y={4} width={18} height={18} rx={2} />
          <line x1={16} y1={2} x2={16} y2={6} />
          <line x1={8} y1={2} x2={8} y2={6} />
          <line x1={3} y1={10} x2={21} y2={10} />
        </>
      );
    case "users":
      return (
        <>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx={9} cy={7} r={4} />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </>
      );
    case "star":
      return (
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      );
    case "gift":
      return (
        <>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x={2} y={7} width={20} height={5} />
          <line x1={12} y1={22} x2={12} y2={7} />
          <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </>
      );
    case "check":
      return <polyline points="20 6 9 17 4 12" strokeWidth={2.5} />;
    case "clock":
      return (
        <>
          <circle cx={12} cy={12} r={10} />
          <polyline points="12 6 12 12 16 14" />
        </>
      );
    case "back":
      return (
        <>
          <line x1={19} y1={12} x2={5} y2={12} />
          <polyline points="12 19 5 12 12 5" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </>
      );
    case "plus":
      return (
        <>
          <line x1={12} y1={5} x2={12} y2={19} strokeWidth={2.5} />
          <line x1={5} y1={12} x2={19} y2={12} strokeWidth={2.5} />
        </>
      );
    case "x":
      return (
        <>
          <line x1={18} y1={6} x2={6} y2={18} />
          <line x1={6} y1={6} x2={18} y2={18} />
        </>
      );
    case "send":
      return (
        <>
          <line x1={22} y1={2} x2={11} y2={13} />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </>
      );
    case "phone":
      return (
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      );
    case "note":
      return (
        <>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1={16} y1={13} x2={8} y2={13} />
          <line x1={16} y1={17} x2={8} y2={17} />
        </>
      );
    case "camera":
      return (
        <>
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeWidth={1.8} />
          <circle cx={12} cy={13} r={4} strokeWidth={1.8} />
        </>
      );
    case "upload":
      return (
        <>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth={1.8} />
          <polyline points="17 8 12 3 7 8" strokeWidth={1.8} />
          <line x1={12} y1={3} x2={12} y2={15} strokeWidth={1.8} />
        </>
      );
    case "pin":
      return (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth={1.8} />
          <circle cx={12} cy={10} r={3} strokeWidth={1.8} />
        </>
      );
    case "sparkle":
      return (
        <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8L8 14 2 9.2h7.6z" strokeWidth={1.8} />
      );
    case "heart":
      return (
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth={1.8} />
      );
    case "map":
      return (
        <>
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" strokeWidth={1.8} />
          <line x1={8} y1={2} x2={8} y2={18} strokeWidth={1.8} />
          <line x1={16} y1={6} x2={16} y2={22} strokeWidth={1.8} />
        </>
      );
    case "info":
      return (
        <>
          <circle cx={12} cy={12} r={10} strokeWidth={1.8} />
          <line x1={12} y1={16} x2={12} y2={12} strokeWidth={1.8} />
          <line x1={12} y1={8} x2={12.01} y2={8} strokeWidth={1.8} />
        </>
      );
    case "dollar":
      return (
        <>
          <line x1={12} y1={1} x2={12} y2={23} strokeWidth={1.8} />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeWidth={1.8} />
        </>
      );
    case "book":
      return (
        <>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeWidth={1.8} />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeWidth={1.8} />
        </>
      );
    case "chevRight":
      return (
        <polyline points="9 18 15 12 9 6" strokeWidth={1.8} />
      );
    case "lock":
      return (
        <>
          <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </>
      );
    default:
      return null;
  }
}
