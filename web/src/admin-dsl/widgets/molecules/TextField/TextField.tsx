/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 122: Added typed text field leaf using FieldShell and native uncontrolled input behavior.
 */
import { FieldShell, fieldDescriptionIds } from "../../atoms/FieldShell";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import type { TextFieldProps } from "./TextField.types";

export function TextField({ id, className, style, dataAttributes, name, label, value, placeholder, helpText, error, disabled = false, readOnly = false, required = false, inputMode = "text", autoComplete, onValueChange }: TextFieldProps) {
  const controlId = id || `admin-field-${name}`;
  return (
    <FieldShell id={id ? `${id}-shell` : undefined} name={name} label={label} controlId={controlId} helpText={helpText} error={error} disabled={disabled} readOnly={readOnly} required={required} style={style} dataAttributes={dataAttributes}>
      <input
        id={controlId}
        name={name}
        type="text"
        defaultValue={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescriptionIds({ controlId, helpText, error })}
        className={["adminDslTextField", className].filter(Boolean).join(" ") || undefined}
        style={{
          ...adminTextStyle("body"),
          minHeight: 42,
          border: `1px solid ${error ? adminTokens.borders.danger : adminTokens.borders.default}`,
          borderRadius: adminTokens.radii.control,
          padding: "10px 12px",
          background: readOnly ? adminTokens.surfaces.muted : adminTokens.surfaces.panel,
          color: adminTokens.text.primary,
          outlineColor: adminTokens.text.accent,
        }}
        onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value, event) : undefined}
        {...widgetDataAttributes("admin.form-field.text-field", "molecule")}
        {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined })}
      />
    </FieldShell>
  );
}
