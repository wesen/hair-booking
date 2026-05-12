import { LENGTH_LABELS } from "../data/consultation-constants";

interface LengthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function LengthSlider({ value, onChange }: LengthSliderProps) {
  return (
    <div data-part="slider-wrap">
      <div data-part="slider-val">{LENGTH_LABELS[value]}</div>
      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: "100%" }}
      />
      <div data-part="slider-labels">
        <span>Current</span>
        <span>Beyond waist</span>
      </div>
    </div>
  );
}
