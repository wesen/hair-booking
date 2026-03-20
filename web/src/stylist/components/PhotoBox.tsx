import { Icon } from "./Icon";

interface PhotoBoxProps {
  label: string;
  hasPhoto?: boolean;
  onClick?: () => void;
}

export function PhotoBox({ label, hasPhoto, onClick }: PhotoBoxProps) {
  return (
    <div
      data-part="photo-box"
      data-has-photo={hasPhoto || undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {hasPhoto ? (
        <Icon name="check" size={28} />
      ) : (
        <Icon name="camera" size={28} />
      )}
      <div data-part="photo-box-label">
        {hasPhoto ? `${label} ✓` : label}
      </div>
    </div>
  );
}
