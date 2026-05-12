import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "default" | "sm";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "default",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      data-part={variant === "outline" ? "btn-outline" : "btn-primary"}
      {...(size === "sm" ? { "data-size": "sm" } : {})}
      {...rest}
    >
      {children}
    </button>
  );
}
