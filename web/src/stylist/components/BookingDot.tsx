interface BookingDotProps {
  step: number;
  currentStep: number;
}

export function BookingDot({ step, currentStep }: BookingDotProps) {
  const state = step === currentStep ? "active" : step < currentStep ? "done" : undefined;
  return <div data-part="booking-dot" data-state={state} />;
}
