import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, ...rest }: InputProps) {
  const input = <input data-part="input" {...rest} />;

  if (icon) {
    return (
      <div data-part="input-with-icon">
        <span data-part="input-icon">{icon}</span>
        {input}
      </div>
    );
  }

  return input;
}
