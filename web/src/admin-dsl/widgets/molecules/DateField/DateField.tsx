/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Replaced scaffold diagnostics with typed native date input using FieldShell.
 */
import { FieldShell, fieldDescriptionIds } from "../../atoms/FieldShell";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { dateFieldWidgetMetadata } from "./DateField.metadata";
import type { DateFieldProps } from "./DateField.types";

export function DateField({ id, className, style, dataAttributes, name, label, value, helpText, error, disabled = false, readOnly = false, required = false, min, max, step, onValueChange }: DateFieldProps) {
  const controlId = id || `admin-field-${name}`;
  const input = (
    <input
      id={controlId}
      name={name}
      type="date"
      defaultValue={value == null ? "" : String(value)}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      min={min as never}
      max={max as never}
      step={step}
      aria-invalid={error ? true : undefined}
      aria-describedby={fieldDescriptionIds({ controlId, helpText, error })}
      className={["adminDslDateField", className].filter(Boolean).join(" ") || undefined}
      style={{
        ...adminTextStyle("body"),
        minHeight: 42,
        width: "100%",
        border: `1px solid ${error ? adminTokens.borders.danger : adminTokens.borders.default}`,
        borderRadius: adminTokens.radii.control,
        padding: "10px 12px",
        background: readOnly ? adminTokens.surfaces.muted : adminTokens.surfaces.panel,
        color: adminTokens.text.primary,
        outlineColor: adminTokens.text.accent,
      }}
      onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value, event) : undefined}
      {...widgetDataAttributes(dateFieldWidgetMetadata.widgetId, dateFieldWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined })}
    />
  );
  return (
    <FieldShell id={id ? `${id}-shell` : undefined} name={name} label={label} controlId={controlId} helpText={helpText} error={error} disabled={disabled} readOnly={readOnly} required={required} style={style} dataAttributes={dataAttributes}>
      {input}
    </FieldShell>
  );
}
