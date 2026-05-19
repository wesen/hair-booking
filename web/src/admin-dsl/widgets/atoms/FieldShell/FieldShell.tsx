/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 121: Added shared field label/help/error chrome using generated design helpers.
 */
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import type { FieldShellProps } from "./FieldShell.types";

export function fieldDescriptionIds({ controlId, helpText, error }: Pick<FieldShellProps, "controlId" | "helpText" | "error">) {
  return [helpText ? `${controlId}-help` : undefined, error ? `${controlId}-error` : undefined].filter(Boolean).join(" ") || undefined;
}

export function FieldShell({ id, className, style, dataAttributes, label, name, controlId, helpText, error, disabled = false, readOnly = false, required = false, children }: FieldShellProps) {
  const resolvedControlId = controlId || id || (name ? `admin-field-${name}` : undefined);
  const helpId = resolvedControlId ? `${resolvedControlId}-help` : undefined;
  const errorId = resolvedControlId ? `${resolvedControlId}-error` : undefined;
  const stateLabel = disabled ? "Disabled" : readOnly ? "Read-only" : undefined;
  return (
    <div
      id={id}
      className={["adminDslFieldShell", className].filter(Boolean).join(" ") || undefined}
      style={{
        display: "grid",
        gap: 8,
        opacity: disabled ? 0.64 : 1,
        ...style,
      }}
      {...widgetDataAttributes("admin.form-field.field-shell", "atom")}
      {...dataAttrsFromRecord({ field: name, invalid: error ? "true" : undefined, disabled: disabled ? "true" : undefined, readonly: readOnly ? "true" : undefined, ...dataAttributes })}
    >
      <label htmlFor={resolvedControlId} style={{ ...adminTextStyle("actionLabel"), color: adminTokens.text.primary, display: "flex", gap: 8, alignItems: "center" }}>
        <span>{label}</span>
        {required ? <span aria-label="required" style={{ color: adminTokens.text.danger }}>*</span> : null}
        {stateLabel ? <span style={{ ...adminTextStyle("bodyMuted") }}>({stateLabel})</span> : null}
      </label>
      {children}
      {helpText ? <p id={helpId} style={{ ...adminTextStyle("bodyMuted"), margin: 0 }}>{helpText}</p> : null}
      {error ? <p id={errorId} role="alert" style={{ ...adminTextStyle("body"), margin: 0, color: adminTokens.text.danger, fontWeight: 800 }}>{error}</p> : null}
    </div>
  );
}
