import React from "react";
import { Icon } from "./Icon";

interface HintProps {
  children: React.ReactNode;
}

export function Hint({ children }: HintProps) {
  return (
    <div data-part="hint">
      <Icon name="info" size={14} />
      <span>{children}</span>
    </div>
  );
}
