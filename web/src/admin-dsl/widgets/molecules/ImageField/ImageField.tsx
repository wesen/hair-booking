/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Replaced scaffold diagnostics with typed image placeholder/reference field.
 */
import { FieldShell } from "../../atoms/FieldShell";
import { ActionButton } from "../../atoms/ActionButton";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { imageFieldWidgetMetadata } from "./ImageField.metadata";
import type { ImageFieldProps } from "./ImageField.types";

export function ImageField({ id, className, style, dataAttributes, name, label, src, alt, placeholder = "No image selected", helpText, error, disabled = false, readOnly = false, required = false, action, onFieldAction }: ImageFieldProps) {
  const controlId = id || `admin-field-${name}`;
  return (
    <FieldShell id={id ? `${id}-shell` : undefined} name={name} label={label} controlId={controlId} helpText={helpText} error={error} disabled={disabled} readOnly={readOnly} required={required} style={style} dataAttributes={dataAttributes}>
      <div
        className={["adminDslImageField", className].filter(Boolean).join(" ") || undefined}
        style={{ display: "grid", gap: 10, border: `1px dashed ${error ? adminTokens.borders.danger : adminTokens.borders.default}`, borderRadius: adminTokens.radii.control, padding: 12, background: readOnly ? adminTokens.surfaces.muted : adminTokens.surfaces.panel }}
        {...widgetDataAttributes(imageFieldWidgetMetadata.widgetId, imageFieldWidgetMetadata.classification.level)}
        {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined, hasimage: src ? "true" : "false" })}
      >
        {src ? <img src={src} alt={alt || label} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: adminTokens.radii.control }} /> : <div style={{ ...adminTextStyle("bodyMuted"), minHeight: 88, display: "grid", placeItems: "center", background: adminTokens.surfaces.muted, borderRadius: adminTokens.radii.control }}>{placeholder}</div>}
        <input id={controlId} name={name} value={src || ""} readOnly aria-hidden="true" tabIndex={-1} style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
        {action && !readOnly && !disabled ? <ActionButton action={action} onAction={(clicked) => onFieldAction?.(clicked, { name, src })} /> : null}
      </div>
    </FieldShell>
  );
}
