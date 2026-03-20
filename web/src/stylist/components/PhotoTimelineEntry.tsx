import type { PhotoEntry } from "../types";
import { Icon } from "./Icon";

interface PhotoTimelineEntryProps {
  entry: PhotoEntry;
}

export function PhotoTimelineEntry({ entry }: PhotoTimelineEntryProps) {
  return (
    <div data-part="photo-entry">
      <div data-part="photo-entry-header">
        {entry.date} — {entry.service}
      </div>
      <div data-part="photo-compare">
        <div data-part="photo-placeholder">
          <Icon name="camera" size={24} />
          BEFORE
        </div>
        <div data-part="photo-placeholder">
          <Icon name="camera" size={24} />
          AFTER
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
        "{entry.caption}"
      </div>
    </div>
  );
}
