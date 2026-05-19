/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Promoted scaffold to sticky save/status bar using ActionGroup for primary action.
 */
import { ActionGroup } from "../ActionGroup";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import type { SaveBarProps } from "./SaveBar.types";

export function SaveBar({ id, className, style, dataAttributes, status, primaryAction, onPrimaryAction }: SaveBarProps) {
  const actions = primaryAction ? [primaryAction] : [];
  return <div id={id} className={["adminDslSaveBar", className].filter(Boolean).join(" ") || undefined} style={{ borderTop: `1px solid ${adminTokens.borders.default}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, ...style }} {...widgetDataAttributes("admin.form.save-bar", "molecule")} {...dataAttrsFromRecord(dataAttributes)}><span className="adminDslSaveStatus" style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.primary, fontWeight: 800, background: adminTokens.surfaces.muted, border: `1px solid ${adminTokens.borders.default}`, borderRadius: adminTokens.radii.pill, padding: "6px 10px" }}>{status}</span>{actions.length ? <ActionGroup actions={actions} slot="formFooter" align="end" context={{ values: {}, status }} onAction={(action, context) => onPrimaryAction?.(action, context)} /> : null}</div>;
}
