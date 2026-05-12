interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  gradientTo?: string;
}

export function ProgressBar({ progress, color = "var(--color-accent)", gradientTo }: ProgressBarProps) {
  const bg = gradientTo
    ? `linear-gradient(90deg, ${color}, ${gradientTo})`
    : color;

  return (
    <div data-part="progress-track">
      <div
        data-part="progress-fill"
        style={{ width: `${Math.min(progress, 100)}%`, background: bg }}
      />
    </div>
  );
}
