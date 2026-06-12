/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Promoted scaffold to typed calendar event/time-off block with action callback.
 */
import { adminTextStyle, adminTokens, color, shadow, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { calendarEventBlockWidgetMetadata } from "./CalendarEventBlock.metadata";
import type { CalendarEventBlockProps } from "./CalendarEventBlock.types";

function blockTone(kind: CalendarEventBlockProps["kind"]) {
  if (kind === "timeOff") return { border: color.warn, background: color.cream };
  if (kind === "availability") return { border: color.success, background: adminTokens.surfaces.panel };
  return { border: adminTokens.text.accent, background: adminTokens.surfaces.panel };
}

export function CalendarEventBlock({ id, className, style, dataAttributes, kind, clientName, title, service, status, startsAt, endsAt, column, row, span = 1, action, onAction }: CalendarEventBlockProps) {
  const tone = blockTone(kind);
  const body = (
    <>
      <strong style={{ ...adminTextStyle("body"), display: "block", fontWeight: 800 }}>{clientName || title || (kind === "timeOff" ? "Time off" : kind === "availability" ? "Available" : "Appointment")}</strong>
      <span style={{ ...adminTextStyle("bodyMuted"), display: "block" }}>{service || status}</span>
      {(startsAt || endsAt) ? <span style={{ ...adminTextStyle("eyebrow"), display: "block", marginTop: 6 }}>{startsAt} – {endsAt}</span> : null}
    </>
  );
  const commonStyle = { textAlign: "left" as const, border: `1px solid ${tone.border}`, borderLeft: `4px solid ${tone.border}`, background: tone.background, borderRadius: adminTokens.radii.control, padding: 12, boxShadow: shadow.sm, cursor: action ? "pointer" : "default", ...style };
  const gridStyle = column || row ? { gridColumn: column, gridRow: row ? `${row} / span ${span}` : undefined, zIndex: 1, alignSelf: "stretch", justifySelf: "stretch", margin: 6, minHeight: 44 } : {};
  if (action) {
    return <button id={id} className={["adminDslCalendarEventBlock", className].filter(Boolean).join(" ") || undefined} type="button" style={{ ...gridStyle, ...commonStyle }} onClick={() => onAction?.(action, { blockId: id })} {...widgetDataAttributes(calendarEventBlockWidgetMetadata.widgetId, calendarEventBlockWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>{body}</button>;
  }
  return <article id={id} className={["adminDslCalendarEventBlock", className].filter(Boolean).join(" ") || undefined} style={{ ...gridStyle, ...commonStyle }} {...widgetDataAttributes(calendarEventBlockWidgetMetadata.widgetId, calendarEventBlockWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>{body}</article>;
}
