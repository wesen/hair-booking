/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Replaced scaffold diagnostics with typed confirm dialog implementation.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { confirmDialogWidgetMetadata } from "./ConfirmDialog.metadata";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

export function ConfirmDialog({ id, className, style, dataAttributes, dialogId, title, body, tone = "neutral", confirmLabel = "Confirm", confirmAction, cancelAction, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirm = confirmAction || { type: "confirm", target: dialogId, label: confirmLabel, intent: tone === "danger" ? "danger" : "primary", placement: "formFooter" };
  return (
    <aside
      id={id || dialogId}
      role="alertdialog"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={body ? `${dialogId}-body` : undefined}
      className={["adminDslConfirmDialog", className].filter(Boolean).join(" ") || undefined}
      style={{ border: `1px solid ${tone === "danger" ? adminTokens.borders.danger : adminTokens.borders.default}`, borderRadius: adminTokens.radii.panel, background: adminTokens.surfaces.panel, padding: 18, display: "grid", gap: 12, ...style }}
      {...widgetDataAttributes(confirmDialogWidgetMetadata.widgetId, confirmDialogWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord({ dialog: dialogId, tone, ...dataAttributes })}
    >
      <h3 id={`${dialogId}-title`} style={{ ...adminTextStyle("panelTitle"), margin: 0 }}>{title}</h3>
      {body ? <p id={`${dialogId}-body`} style={{ ...adminTextStyle("bodyMuted"), margin: 0 }}>{body}</p> : null}
      <ActionGroup actions={[...(cancelAction ? [cancelAction] : []), confirm]} slot="formFooter" context={{ dialogId }} onAction={(action) => action === confirm ? onConfirm?.(action, { dialogId }) : onCancel?.(action, { dialogId })} />
    </aside>
  );
}
