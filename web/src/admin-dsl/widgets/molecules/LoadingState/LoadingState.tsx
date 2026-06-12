/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Promoted scaffold to accessible loading state using shared Admin DSL design helpers.
 */
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { loadingStateWidgetMetadata } from "./LoadingState.metadata";
import type { LoadingStateProps } from "./LoadingState.types";

export function LoadingState({ id, className, style, dataAttributes, title = "Loading", body }: LoadingStateProps) {
  return (
    <div
      id={id}
      className={["adminDslLoadingState", className].filter(Boolean).join(" ") || undefined}
      aria-busy="true"
      aria-live="polite"
      style={{ ...adminSurfaceStyle, padding: 16, display: "grid", gap: 8, ...style }}
      {...widgetDataAttributes(loadingStateWidgetMetadata.widgetId, loadingStateWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <div style={{ ...adminTextStyle("panelTitle") }}>{title}</div>
      {body ? <p style={{ ...adminTextStyle("bodyMuted"), margin: 0 }}>{body}</p> : null}
      <div aria-hidden="true" style={{ height: 8, borderRadius: adminTokens.radii.pill, background: `linear-gradient(90deg, ${adminTokens.borders.default}, ${adminTokens.surfaces.muted}, ${adminTokens.borders.default})` }} />
    </div>
  );
}
