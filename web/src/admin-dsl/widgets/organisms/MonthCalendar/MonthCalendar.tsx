/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Promoted scaffold to typed month calendar with month/date action callbacks.
 */
import { adminTextStyle, adminTokens, badgeToneStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { monthCalendarWidgetMetadata } from "./MonthCalendar.metadata";
import type { MonthCalendarCell, MonthCalendarProps } from "./MonthCalendar.types";

function buildMonthCells(month: string): MonthCalendarCell[] {
  const [yearPart, monthPart] = month.split("-").map((part) => Number(part));
  const year = yearPart || new Date().getFullYear();
  const monthIndex = (monthPart || new Date().getMonth() + 1) - 1;
  const first = new Date(year, monthIndex, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return { date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`, day: date.getDate(), inMonth: date.getMonth() === monthIndex }; });
}

function defaultLabel(month: string) { return new Date(`${month}-01T00:00:00`).toLocaleString("en", { month: "long", year: "numeric" }); }

export function MonthCalendar({ id, className, style, dataAttributes, calendarId, month, label, selectedDate, markers = [], legend = [], previousMonthAction, nextMonthAction, selectDateAction, onMonthAction, onSelectDate }: MonthCalendarProps) {
  const markerByDate = new Map<string, typeof markers>();
  markers.forEach((marker) => markerByDate.set(marker.date, [...(markerByDate.get(marker.date) || []), marker]));
  return (
    <div id={id} className={["adminDslMonthCalendar", className].filter(Boolean).join(" ") || undefined} style={{ display: "grid", gap: 12, ...style }} {...widgetDataAttributes(monthCalendarWidgetMetadata.widgetId, monthCalendarWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 }}>
        <button type="button" aria-label="Previous month" disabled={!previousMonthAction} onClick={() => previousMonthAction && onMonthAction?.(previousMonthAction, { calendarId, month, direction: "previous" })} style={{ width: 30, height: 30, borderRadius: adminTokens.radii.control, border: `1px solid ${adminTokens.borders.default}`, background: adminTokens.surfaces.panel, cursor: previousMonthAction ? "pointer" : "default" }}>‹</button>
        <div style={{ ...adminTextStyle("body"), fontWeight: 800, textAlign: "center" }}>{label || defaultLabel(month)}</div>
        <button type="button" aria-label="Next month" disabled={!nextMonthAction} onClick={() => nextMonthAction && onMonthAction?.(nextMonthAction, { calendarId, month, direction: "next" })} style={{ width: 30, height: 30, borderRadius: adminTokens.radii.control, border: `1px solid ${adminTokens.borders.default}`, background: adminTokens.surfaces.panel, cursor: nextMonthAction ? "pointer" : "default" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => <div key={`${day}-${i}`} style={{ ...adminTextStyle("eyebrow"), textAlign: "center", color: adminTokens.text.primary }}>{day}</div>)}
        {buildMonthCells(month).map((cell) => { const active = selectedDate === cell.date; const cellMarkers = markerByDate.get(cell.date) || []; const scheduled = cellMarkers.some((marker) => marker.kind === "scheduled"); const markerTone = badgeToneStyle(cellMarkers[0]?.tone || (scheduled ? "warning" : "success")); return <button key={cell.date} type="button" disabled={!selectDateAction} title={`Select ${cell.date}`} aria-pressed={active} onClick={() => selectDateAction && onSelectDate?.(selectDateAction, { calendarId, date: cell.date })} style={{ minHeight: 38, borderRadius: adminTokens.radii.control, border: `1px solid ${active ? adminTokens.text.primary : scheduled ? markerTone.borderColor : "transparent"}`, background: active ? adminTokens.text.primary : scheduled ? markerTone.background : "transparent", color: active ? adminTokens.surfaces.panel : cell.inMonth ? adminTokens.text.primary : adminTokens.text.muted, display: "grid", placeItems: "center", gap: 2, cursor: selectDateAction ? "pointer" : "default" }}><span style={{ ...adminTextStyle("bodyMuted"), fontWeight: 800 }}>{cell.day}</span>{cellMarkers.length ? <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: adminTokens.radii.pill, background: markerTone.color }} /> : null}</button>; })}
      </div>
      {legend.length ? <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{legend.map((item) => { const tone = badgeToneStyle(item.tone || "neutral"); return <span key={item.kind || item.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, ...adminTextStyle("bodyMuted") }}><span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: adminTokens.radii.pill, background: tone.color }} />{item.label}</span>; })}</div> : null}
    </div>
  );
}
