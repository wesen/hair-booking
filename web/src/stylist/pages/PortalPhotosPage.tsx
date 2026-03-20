import { useAppSelector } from "../store";
import { PhotoTimelineEntry } from "../components/PhotoTimelineEntry";
import { Icon } from "../components/Icon";

export function PortalPhotosPage() {
  const photos = useAppSelector(s => s.portal.photos);

  return (
    <div data-part="page-content">
      <div data-part="section-heading" style={{ marginBottom: 6 }}>My Photos</div>
      <div data-part="section-label">YOUR HAIR JOURNEY</div>

      {photos.map(entry => (
        <PhotoTimelineEntry key={entry.id} entry={entry} />
      ))}

      <button data-part="book-cta">
        <Icon name="camera" size={16} /> Upload New Photos
      </button>
    </div>
  );
}
