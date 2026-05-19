/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Promoted scaffold to responsive image summary grid using shared media-card styling.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, badgeToneStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { imageGridWidgetMetadata } from "./ImageGrid.metadata";
import type { ImageGridProps } from "./ImageGrid.types";

function MediaThumb({ title, url }: { title: string; url?: string }) {
  if (url) return <img src={url} alt="" aria-hidden="true" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", borderBottom: `1px solid ${adminTokens.borders.default}` }} />;
  return <div aria-hidden="true" style={{ aspectRatio: "4 / 3", background: `linear-gradient(135deg, ${adminTokens.surfaces.muted}, ${adminTokens.surfaces.panel})`, borderBottom: `1px solid ${adminTokens.borders.default}`, display: "grid", placeItems: "center", color: adminTokens.text.muted, ...adminTextStyle("eyebrow") }}>{title.slice(0, 1).toUpperCase()}</div>;
}

export function ImageGrid({ id, className, style, dataAttributes, items, actions = [], onAction }: ImageGridProps) {
  if (!items.length) return <div id={id} className={className} style={{ ...adminSurfaceStyle, padding: 18, color: adminTokens.text.muted, ...adminTextStyle("bodyMuted"), ...style }} {...widgetDataAttributes(imageGridWidgetMetadata.widgetId, imageGridWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>No media assets.</div>;
  return (
    <div id={id} className={["adminDslImageGrid", className].filter(Boolean).join(" ") || undefined} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, ...style }} {...widgetDataAttributes(imageGridWidgetMetadata.widgetId, imageGridWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      {items.map((item) => {
        const tone = badgeToneStyle(item.tone || "neutral");
        return <article key={item.id || item.title} style={{ ...adminSurfaceStyle, overflow: "hidden" }}><MediaThumb title={item.title} url={item.url} /><div style={{ padding: 12 }}><div style={{ ...adminTextStyle("panelTitle"), fontSize: 18 }}>{item.title}</div>{item.subtitle ? <div style={{ ...adminTextStyle("bodyMuted"), marginTop: 4 }}>{item.subtitle}</div> : null}{item.status ? <span style={{ display: "inline-flex", marginTop: 8, borderRadius: adminTokens.radii.pill, padding: "4px 8px", background: tone.background, border: `1px solid ${tone.borderColor}`, color: tone.color, fontWeight: 700, ...adminTextStyle("eyebrow") }}>{item.status}</span> : null}{actions.length ? <div style={{ marginTop: 10 }}><ActionGroup actions={actions} slot="detail" align="start" context={{ item }} onAction={(action, context) => onAction?.(action, context)} /></div> : null}</div></article>;
      })}
    </div>
  );
}
