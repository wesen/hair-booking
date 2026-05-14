import { type CSSProperties, useRef, useState } from "react";
import { color } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface PhotoTileProps<TValue extends string = string> {
  value?: TValue;
  label: string;
  filled?: boolean;
  disabled?: boolean;
  /** URL of uploaded image to display as preview */
  imageUrl?: string;
  /** Alt text for the preview image */
  imageAlt?: string;
  /** Accepted file types for the file picker (e.g. "image/jpeg,image/png,image/webp") */
  accept?: string;
  /** Maximum upload size in bytes */
  maxBytes?: number;
  onClick?: () => void;
  onUpload?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  /** Called with the selected file — the caller handles actual upload + dispatch */
  onUploadFile?: (file: File, value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  onRemove?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

export function PhotoTile<TValue extends string = string>({
  value,
  label,
  filled,
  disabled = false,
  imageUrl,
  imageAlt,
  accept,
  onClick,
  onUpload,
  onUploadFile,
  onRemove,
  style,
}: PhotoTileProps<TValue>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const optionValue = (value ?? label) as TValue;
  const interactive = Boolean(onClick || onUpload || onUploadFile || onRemove) && !disabled;
  const showPreview = filled && imageUrl;

  const handleChooseFile = () => {
    if (disabled || uploading) return;
    setUploadError(null);
    inputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected
    e.target.value = "";

    if (onUploadFile) {
      setUploading(true);
      setUploadError(null);
      Promise.resolve()
        .then(() => onUploadFile(file, optionValue, {
          value: optionValue,
          label,
          action: "upload",
          source: "pointer",
        }))
        .catch((err) => {
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        })
        .finally(() => setUploading(false));
      return;
    }
    // Fallback: no onUploadFile, just call onUpload
    onUpload?.(optionValue, {
      value: optionValue,
      label,
      action: "upload",
      source: "pointer",
    });
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    onClick?.();
    if (filled) {
      onRemove?.(optionValue, {
        value: optionValue,
        label,
        action: "remove",
        source: "pointer",
      });
    } else if (onUploadFile) {
      handleChooseFile();
    } else {
      onUpload?.(optionValue, {
        value: optionValue,
        label,
        action: "upload",
        source: "pointer",
      });
    }
  };

  return (
    <button
      data-component="PhotoTile"
      data-part={uploading ? "uploading" : filled ? "filled" : disabled ? "disabled" : "empty"}
      type="button"
      disabled={disabled || uploading}
      aria-pressed={filled}
      onClick={handleClick}
      style={{
        aspectRatio: "1/1.2",
        background: showPreview ? color.paper : filled ? color.peachSoft : color.cream,
        border: `1px dashed ${uploadError ? color.danger : filled ? color.plum : color.soft}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: 1.8,
        textTransform: "uppercase" as const,
        fontWeight: 600,
        color: filled ? color.plum : disabled ? color.soft : color.soft,
        cursor: interactive && !uploading ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.55 : uploading ? 0.7 : 1,
        padding: 0,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/jpeg,image/png,image/webp"}
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* Image preview */}
      {showPreview && (
        <img
          src={imageUrl}
          alt={imageAlt || label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.85,
          }}
        />
      )}

      {/* Label overlay */}
      <span style={{
        position: "relative",
        zIndex: 1,
        background: showPreview ? "rgba(255,255,255,0.75)" : "transparent",
        padding: showPreview ? "4px 8px" : 0,
        borderRadius: showPreview ? 4 : 0,
        textShadow: showPreview ? "0 0 4px rgba(255,255,255,0.5)" : "none",
      }}>
        {uploading ? "…" : filled && !showPreview ? `✓ ${label}` : label}
      </span>

      {/* Upload error indicator */}
      {uploadError && (
        <div style={{
          position: "absolute",
          bottom: 4,
          left: 4,
          right: 4,
          fontSize: 8,
          color: color.danger,
          textAlign: "center",
          zIndex: 2,
        }}>
          ✗
        </div>
      )}
    </button>
  );
}
