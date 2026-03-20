interface TopBarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
}

export function TopBar({ title, subtitle, right, left }: TopBarProps) {
  return (
    <div data-part="top-bar">
      <div>
        {left}
        <h1 data-part="top-bar-title">{title}</h1>
        {subtitle && <div data-part="top-bar-sub">{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
