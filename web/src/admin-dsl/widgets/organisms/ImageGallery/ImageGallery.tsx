/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Promoted scaffold to accessible image gallery with missing-media fallback and image action callbacks.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, badgeToneStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { imageGalleryWidgetMetadata } from "./ImageGallery.metadata";
import type { GalleryImage, ImageGalleryProps } from "./ImageGallery.types";

function imageKey(image: GalleryImage) { return String(image.id || image.slot || image.title || "photo"); }

function ImageBody({ image }: { image: GalleryImage }) {
  const title = String(image.title || image.slot || "Photo");
  const tone = badgeToneStyle(image.tone || "neutral");
  return <>{image.url ? <img src={image.url} alt={image.alt || title} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", borderBottom: `1px solid ${adminTokens.borders.default}` }} /> : <div style={{ aspectRatio: "4 / 3", display: "grid", placeItems: "center", background: adminTokens.surfaces.muted, borderBottom: `1px solid ${adminTokens.borders.default}`, color: adminTokens.text.danger, ...adminTextStyle("eyebrow") }}>Missing photo</div>}<div style={{ padding: 12 }}><div style={{ ...adminTextStyle("panelTitle"), fontSize: 18 }}>{title}</div>{image.subtitle ? <div style={{ ...adminTextStyle("bodyMuted"), marginTop: 4 }}>{image.subtitle}</div> : null}{image.status ? <span style={{ display: "inline-flex", marginTop: 8, borderRadius: adminTokens.radii.pill, padding: "4px 8px", background: tone.background, border: `1px solid ${tone.borderColor}`, color: tone.color, fontWeight: 700, ...adminTextStyle("eyebrow") }}>{image.status}</span> : null}</div></>;
}

export function ImageGallery({ id, className, style, dataAttributes, galleryId, images, emptyText = "No photos uploaded yet.", imageAction, onImageAction }: ImageGalleryProps) {
  if (!images.length) return <div id={id} className={className} style={{ ...adminSurfaceStyle, padding: 18, color: adminTokens.text.muted, ...adminTextStyle("bodyMuted"), ...style }} {...widgetDataAttributes(imageGalleryWidgetMetadata.widgetId, imageGalleryWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>{emptyText}</div>;
  return (
    <div id={id} className={["adminDslImageGallery", className].filter(Boolean).join(" ") || undefined} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, ...style }} {...widgetDataAttributes(imageGalleryWidgetMetadata.widgetId, imageGalleryWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      {images.map((image) => {
        const title = String(image.title || image.slot || "photo");
        const actionLabel = String(imageAction?.label || imageAction?.target || "Open").replace(/\s+photo$/i, "");
        const action = imageAction ? { ...imageAction, label: `${actionLabel} ${title}` } : undefined;
        return <article key={imageKey(image)} style={{ ...adminSurfaceStyle, overflow: "hidden" }}><ImageBody image={image} />{action ? <div style={{ padding: "0 12px 12px" }}><ActionGroup actions={[action]} slot="detail" align="start" context={{ galleryId, image }} onAction={(clickedAction, context) => onImageAction?.(clickedAction, context)} /></div> : null}</article>;
      })}
    </div>
  );
}
