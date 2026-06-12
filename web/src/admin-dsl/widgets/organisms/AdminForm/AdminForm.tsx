/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Promoted scaffold to lifecycle-aware admin form with typed action callbacks.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import type { AdminFormProps } from "./AdminForm.types";

function lifecycleLabel({ pending, dirty, state }: Pick<AdminFormProps, "pending" | "dirty" | "state">) {
  if (pending || state === "pending") return "Saving…";
  if (state === "success") return "Saved";
  if (state === "error") return "Needs attention";
  if (dirty || state === "dirty") return "Unsaved changes";
  return undefined;
}

function collectValues(form: HTMLFormElement | null): Record<string, unknown> {
  if (!form) return {};
  const values: Record<string, unknown> = {};
  new FormData(form).forEach((value, key) => { values[key] = value; });
  return values;
}

export function AdminForm<Values = Record<string, unknown>>({ id, className, style, dataAttributes, formId, title, dirty, pending, state = "idle", errors = {}, actions = [], children, onFormAction }: AdminFormProps<Values>) {
  const lifecycle = lifecycleLabel({ pending, dirty, state });
  const errorEntries = Object.entries(errors);
  return (
    <form id={id || formId} className={["adminDslForm", className].filter(Boolean).join(" ") || undefined} aria-busy={pending || state === "pending" || undefined} style={{ display: "grid", gap: 16, opacity: pending || state === "pending" ? 0.76 : 1, ...style }} onSubmit={(event) => event.preventDefault()} {...widgetDataAttributes("admin.form.admin-form", "organism")} {...dataAttrsFromRecord(dataAttributes)}>
      {title ? <h3 style={{ ...adminTextStyle("panelTitle"), margin: 0 }}>{title}</h3> : null}
      {lifecycle ? <div className="adminDslFormLifecycle" style={{ ...adminTextStyle("eyebrow"), border: `1px solid ${state === "error" ? adminTokens.borders.danger : adminTokens.borders.default}`, borderRadius: adminTokens.radii.pill, padding: "6px 10px", width: "fit-content", background: adminTokens.surfaces.panel }}>{lifecycle}</div> : null}
      {errorEntries.length ? <div className="adminDslFormErrors" style={{ border: `1px solid ${adminTokens.borders.danger}`, borderRadius: adminTokens.radii.control, padding: 10, color: adminTokens.text.danger, display: "grid", gap: 4 }}>{errorEntries.map(([name, message]) => <div key={name} style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.danger }}><strong>{name}</strong>: {message}</div>)}</div> : null}
      {children}
      {actions.length ? <ActionGroup actions={actions} slot="formFooter" align="end" context={{ formId, values: collectValues(typeof document !== "undefined" ? document.getElementById(id || formId) as HTMLFormElement | null : null), state }} onAction={(action, context) => onFormAction?.(action, context as { formId: string; values: Values; state: AdminFormProps["state"] })} /> : null}
    </form>
  );
}
