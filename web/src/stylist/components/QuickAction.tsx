import type { IconName } from "../types";
import { Icon } from "./Icon";

interface QuickActionProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
}

export function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button data-part="quick-action" onClick={onClick}>
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
}
