interface SegmentToggleProps {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}

export function SegmentToggle({ options, active, onChange }: SegmentToggleProps) {
  return (
    <div data-part="segment-toggle">
      {options.map(opt => (
        <button
          key={opt}
          data-part="segment-btn"
          data-active={opt === active || undefined}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
