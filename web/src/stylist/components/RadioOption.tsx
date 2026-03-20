import React from "react";

interface RadioOptionProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function RadioOption({ selected, onClick, children }: RadioOptionProps) {
  return (
    <div
      data-part="radio-opt"
      data-selected={selected || undefined}
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
    >
      <div data-part="radio-dot">
        <div data-part="radio-dot-inner" />
      </div>
      {children}
    </div>
  );
}
