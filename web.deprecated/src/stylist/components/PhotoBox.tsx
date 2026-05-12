import { useRef } from "react";
import { Icon } from "./Icon";

interface PhotoBoxProps {
  label: string;
  hasPhoto?: boolean;
  onClick?: () => void;
  onFileSelect?: (file: File) => void;
}

export function PhotoBox({ label, hasPhoto, onClick, onFileSelect }: PhotoBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleActivate = () => {
    if (onFileSelect) {
      inputRef.current?.click();
      return;
    }
    onClick?.();
  };

  return (
    <>
      <div
        data-part="photo-box"
        data-has-photo={hasPhoto || undefined}
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate();
          }
        }}
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
      {onFileSelect && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFileSelect(file);
            }
            event.currentTarget.value = "";
          }}
        />
      )}
    </>
  );
}
