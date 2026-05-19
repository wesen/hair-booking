/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Promoted scaffold to preview panel with iframe/placeholder states and action callbacks.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { previewFrameWidgetMetadata } from "./PreviewFrame.metadata";
import type { PreviewFrameProps } from "./PreviewFrame.types";

export function PreviewFrame({ id, className, style, dataAttributes, previewId, kicker = "Preview", title, body, url, height = 420, placeholder = "Preview route not connected yet", actions = [], onAction }: PreviewFrameProps) {
  return (
    <section id={id} className={["adminDslPreviewFrame", className].filter(Boolean).join(" ") || undefined} style={{ ...adminSurfaceStyle, padding: 14, display: "grid", gap: 12, ...style }} {...widgetDataAttributes(previewFrameWidgetMetadata.widgetId, previewFrameWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      <div>
        <div style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted }}>{kicker}</div>
        <h3 style={{ ...adminTextStyle("panelTitle"), margin: "4px 0 0" }}>{title}</h3>
        {body ? <p style={{ ...adminTextStyle("bodyMuted"), margin: "8px 0 0" }}>{body}</p> : null}
      </div>
      {url ? <iframe title={title} src={url} style={{ width: "100%", minHeight: height, border: `1px solid ${adminTokens.borders.default}`, borderRadius: adminTokens.radii.panel, background: adminTokens.surfaces.panel }} /> : <div style={{ minHeight: height || 260, border: `1px dashed ${adminTokens.borders.default}`, borderRadius: adminTokens.radii.panel, display: "grid", placeItems: "center", color: adminTokens.text.muted, ...adminTextStyle("bodyMuted") }}>{placeholder}</div>}
      {actions.length ? <ActionGroup actions={actions} slot="panelFooter" align="end" context={{ previewId, url }} onAction={(action, context) => onAction?.(action, context)} /> : null}
    </section>
  );
}
