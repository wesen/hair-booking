import React from "react";

interface CardProps {
  variant?: "default" | "rose" | "gold";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  className,
  style,
  onClick,
  children,
}: CardProps) {
  return (
    <div
      data-part="card"
      {...(variant !== "default" ? { "data-variant": variant } : {})}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
