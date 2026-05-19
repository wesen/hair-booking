/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to action-capable empty state using ActionGroup and shared surfaces.
 */
import { ActionGroup } from "../ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { emptyStateWidgetMetadata } from "./EmptyState.metadata";
import type { EmptyStateProps } from "./EmptyState.types";

export function EmptyState({ id, className, style, dataAttributes, title, body, action, onAction }: EmptyStateProps) {
  const actions = action ? [action] : [];
  return (
    <section id={id} className={["adminDslEmptyState", className].filter(Boolean).join(" ") || undefined} style={{ ...adminSurfaceStyle, padding: 28, textAlign: "center", background: adminTokens.surfaces.muted, display: "grid", justifyItems: "center", gap: 10, ...style }} {...widgetDataAttributes(emptyStateWidgetMetadata.widgetId, emptyStateWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      <h3 style={{ ...adminTextStyle("panelTitle"), margin: 0 }}>{title}</h3>
      {body ? <p style={{ ...adminTextStyle("bodyMuted"), maxWidth: 460, margin: 0 }}>{body}</p> : null}
      {actions.length ? <ActionGroup actions={actions} slot="detail" align="start" context={{ source: "emptyState" as const, title }} onAction={(clickedAction, context) => onAction?.(clickedAction, context)} /> : null}
    </section>
  );
}
