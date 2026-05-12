import type { Service } from "../types";

interface ServiceOptionProps {
  service: Service;
  selected?: boolean;
  onClick?: () => void;
}

export function ServiceOption({ service, selected, onClick }: ServiceOptionProps) {
  return (
    <div
      data-part="service-option"
      data-selected={selected || undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div data-part="service-emoji">{service.emoji}</div>
      <div data-part="service-details">
        <div data-part="service-name">{service.name}</div>
        <div data-part="service-meta">{service.duration}</div>
      </div>
      <div data-part="service-price">${service.price}</div>
    </div>
  );
}
