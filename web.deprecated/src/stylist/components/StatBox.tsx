interface StatBoxProps {
  value: number | string;
  label: string;
}

export function StatBox({ value, label }: StatBoxProps) {
  return (
    <div data-part="stat-box">
      <div data-part="stat-num">{value}</div>
      <div data-part="stat-label">{label}</div>
    </div>
  );
}
