/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Promoted scaffold to styled fieldset using shared Admin DSL design helpers.
 */
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import type { FieldGroupProps } from "./FieldGroup.types";

export function FieldGroup({ id, className, style, dataAttributes, title, children }: FieldGroupProps) {
  return <fieldset id={id} className={["adminDslFieldGroup", className].filter(Boolean).join(" ") || undefined} style={{ border: `1px solid ${adminTokens.borders.default}`, borderRadius: adminTokens.radii.control, padding: 14, display: "grid", gap: 12, ...style }} {...widgetDataAttributes("admin.form.field-group", "molecule")} {...dataAttrsFromRecord(dataAttributes)}><legend style={{ ...adminTextStyle("eyebrow") }}>{title}</legend>{children}</fieldset>;
}
