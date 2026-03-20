import type { PhotoEntry } from "../types";
import { Icon } from "./Icon";

interface PhotoTimelineEntryProps {
  entry: PhotoEntry;
}

export function PhotoTimelineEntry({ entry }: PhotoTimelineEntryProps) {
  const renderPhotoPane = (label: "BEFORE" | "AFTER", url: string | null) => {
    if (url) {
      return (
        <div data-part="photo-pane">
          <img
            src={url}
            alt={`${entry.service} ${label.toLowerCase()} photo`}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: 14,
              display: "block",
              marginBottom: 6,
            }}
          />
          <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>{label}</div>
        </div>
      );
    }

    return (
      <div data-part="photo-placeholder">
        <Icon name="camera" size={24} />
        {label}
      </div>
    );
  };

  return (
    <div data-part="photo-entry">
      <div data-part="photo-entry-header">
        {entry.date} - {entry.service}
      </div>
      <div data-part="photo-compare">
        {renderPhotoPane("BEFORE", entry.beforeUrl)}
        {renderPhotoPane("AFTER", entry.afterUrl)}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", marginTop: 8 }}>
        "{entry.caption}"
      </div>
    </div>
  );
}
