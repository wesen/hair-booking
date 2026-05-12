interface CheckPillProps {
  label: string;
  checked?: boolean;
  onClick?: () => void;
}

export function CheckPill({ label, checked, onClick }: CheckPillProps) {
  return (
    <div
      data-part="check-pill"
      data-checked={checked || undefined}
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
    >
      {checked && "✓ "}{label}
    </div>
  );
}
