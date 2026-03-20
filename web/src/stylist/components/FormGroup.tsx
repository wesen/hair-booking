import React from "react";
import { Icon } from "./Icon";

interface FormGroupProps {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

export function FormGroup({ label, hint, required, children }: FormGroupProps) {
  return (
    <div data-part="form-group">
      <label data-part="form-label">
        {label}
        {required && <span style={{ color: "var(--color-accent)" }}> (required)</span>}
      </label>
      {children}
      {hint && (
        <div data-part="hint">
          <Icon name="info" size={14} />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}
