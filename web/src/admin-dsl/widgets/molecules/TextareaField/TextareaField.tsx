/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 123: Added typed textarea field leaf using FieldShell and native uncontrolled textarea behavior.
 */
import { FieldShell, fieldDescriptionIds } from "../../atoms/FieldShell";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { textareaFieldWidgetMetadata } from "./TextareaField.metadata";
import type { TextareaFieldProps } from "./TextareaField.types";

export function TextareaField({ id, className, style, dataAttributes, name, label, value, placeholder, rows = 4, helpText, error, disabled = false, readOnly = false, required = false, onValueChange }: TextareaFieldProps) {
  const controlId = id || `admin-field-${name}`;
  return (
    <FieldShell id={id ? `${id}-shell` : undefined} name={name} label={label} controlId={controlId} helpText={helpText} error={error} disabled={disabled} readOnly={readOnly} required={required} style={style} dataAttributes={dataAttributes}>
      <textarea
        id={controlId}
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescriptionIds({ controlId, helpText, error })}
        className={["adminDslTextareaField", className].filter(Boolean).join(" ") || undefined}
        style={{
          ...adminTextStyle("body"),
          minHeight: Math.max(rows, 2) * 24 + 28,
          resize: "vertical",
          border: `1px solid ${error ? adminTokens.borders.danger : adminTokens.borders.default}`,
          borderRadius: adminTokens.radii.control,
          padding: "10px 12px",
          background: readOnly ? adminTokens.surfaces.muted : adminTokens.surfaces.panel,
          color: adminTokens.text.primary,
          outlineColor: adminTokens.text.accent,
        }}
        onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value, event) : undefined}
        {...widgetDataAttributes(textareaFieldWidgetMetadata.widgetId, textareaFieldWidgetMetadata.classification.level)}
        {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined })}
      />
    </FieldShell>
  );
}
