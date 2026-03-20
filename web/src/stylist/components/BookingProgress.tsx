import { BookingDot } from "./BookingDot";

interface BookingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function BookingProgress({ currentStep, totalSteps = 4 }: BookingProgressProps) {
  return (
    <div data-part="booking-progress">
      {Array.from({ length: totalSteps }, (_, i) => (
        <BookingDot key={i + 1} step={i + 1} currentStep={currentStep} />
      ))}
      <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)" }}>
        Step {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
