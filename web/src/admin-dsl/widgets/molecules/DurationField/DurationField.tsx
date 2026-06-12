/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Replaced scaffold diagnostics with typed native number input using FieldShell.
 */
import { FieldShell, fieldDescriptionIds } from "../../atoms/FieldShell";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { durationFieldWidgetMetadata } from "./DurationField.metadata";
import type { DurationFieldProps } from "./DurationField.types";

export function DurationField({ id, className, style, dataAttributes, name, label, value, helpText, error, disabled = false, readOnly = false, required = false, min, max, step, unit = "minutes", onValueChange }: DurationFieldProps) {
  const controlId = id || `admin-field-${name}`;
  const input = (
    <input
      id={controlId}
      name={name}
      type="number"
      defaultValue={value == null ? "" : String(value)}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      min={min as never}
      max={max as never}
      step={step}
      aria-invalid={error ? true : undefined}
      aria-describedby={fieldDescriptionIds({ controlId, helpText, error })}
      className={["adminDslDurationField", className].filter(Boolean).join(" ") || undefined}
      style={{
        ...adminTextStyle("body"),
        minHeight: 42,
        width: "100%",
        border: `1px solid ${error ? adminTokens.borders.danger : adminTokens.borders.default}`,
        borderRadius: `${adminTokens.radii.control} 0 0 ${adminTokens.radii.control}`,
        padding: "10px 12px",
        background: readOnly ? adminTokens.surfaces.muted : adminTokens.surfaces.panel,
        color: adminTokens.text.primary,
        outlineColor: adminTokens.text.accent,
      }}
      onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value, event) : undefined}
      {...widgetDataAttributes(durationFieldWidgetMetadata.widgetId, durationFieldWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined })}
    />
  );
  return (
    <FieldShell id={id ? `${id}-shell` : undefined} name={name} label={label} controlId={controlId} helpText={helpText} error={error} disabled={disabled} readOnly={readOnly} required={required} style={style} dataAttributes={dataAttributes}>
      <div style={{ display: "flex", alignItems: "stretch" }}>{input}{unit ? <span style={{ ...adminTextStyle("bodyMuted"), padding: "0 10px", border: `1px solid ${adminTokens.borders.default}`, borderLeft: 0, borderRadius: `0 ${adminTokens.radii.control} ${adminTokens.radii.control} 0`, display: "inline-flex", alignItems: "center", background: adminTokens.surfaces.muted }}>{unit}</span> : null}</div>
    </FieldShell>
  );
}
