import type { IconName } from "../types";
import { Icon } from "./Icon";

interface SectionTitleProps {
  icon?: IconName;
  children: React.ReactNode;
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <div data-part="section-title">
      {icon && <Icon name={icon} size={18} />}
      {children}
    </div>
  );
}
