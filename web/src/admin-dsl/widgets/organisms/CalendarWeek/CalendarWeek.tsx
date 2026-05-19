/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Promoted scaffold to week grid and mobile agenda using CalendarEventBlock children.
 */
import { CalendarEventBlock } from "../../molecules/CalendarEventBlock";
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { calendarWeekWidgetMetadata } from "./CalendarWeek.metadata";
import type { CalendarWeekProps } from "./CalendarWeek.types";

function groupsByDay(blocks: CalendarWeekProps["blocks"], days: string[]) {
  return days.map((day, dayIndex) => ({ day, blocks: blocks.filter((block) => Math.min(Math.max(block.column || 1, 1), Math.max(days.length, 1)) === dayIndex + 1) })).filter((group) => group.blocks.length > 0);
}

export function CalendarWeek({ id, className, style, dataAttributes, calendarId, days, hours, blocks, onBlockAction }: CalendarWeekProps) {
  const groups = groupsByDay(blocks, days);
  return (
    <div id={id} className={["adminDslCalendarWeek", className].filter(Boolean).join(" ") || undefined} style={style} {...widgetDataAttributes(calendarWeekWidgetMetadata.widgetId, calendarWeekWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      <div className="adminDslCalendarScroller" style={{ ...adminSurfaceStyle, overflowX: "auto", overflowY: "hidden" }}>
        <div className="adminDslCalendarInner" style={{ minWidth: 620 }}>
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${Math.max(days.length, 1)}, 1fr)`, borderBottom: `1px solid ${adminTokens.borders.default}` }}><div />{days.map((day) => <div key={day} style={{ ...adminTextStyle("eyebrow"), padding: 12, textAlign: "center", borderLeft: `1px solid ${adminTokens.borders.default}` }}>{day}</div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", minHeight: 420 }}>
            <div style={{ display: "grid", gridTemplateRows: `repeat(${hours.length}, minmax(58px, 1fr))` }}>{hours.map((hour) => <div key={hour} style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted, padding: 8, borderBottom: `1px solid ${adminTokens.borders.soft}` }}>{hour}</div>)}</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(96px, 1fr))`, gridTemplateRows: `repeat(${hours.length}, minmax(58px, 1fr))`, background: adminTokens.surfaces.muted }}>
              {days.flatMap((day, dayIndex) => hours.map((hour, hourIndex) => <div key={`${day}:${hour}`} style={{ gridColumn: dayIndex + 1, gridRow: hourIndex + 1, borderLeft: `1px solid ${adminTokens.borders.soft}`, borderBottom: `1px solid ${adminTokens.borders.soft}` }} />))}
              {blocks.map((block) => <CalendarEventBlock key={block.id} {...block} onAction={(action) => onBlockAction?.(action, { block })} />)}
            </div>
          </div>
        </div>
      </div>
      <div className="adminDslCalendarAgenda" style={{ display: "none", gap: 12 }} data-calendar-id={calendarId}>{groups.length ? groups.map((group) => <section key={group.day} style={{ ...adminSurfaceStyle, padding: 14 }}><h3 style={{ ...adminTextStyle("panelTitle"), margin: "0 0 12px" }}>{group.day}</h3><div style={{ display: "grid", gap: 10 }}>{group.blocks.map((block) => <CalendarEventBlock key={block.id} {...block} column={undefined} row={undefined} span={undefined} onAction={(action) => onBlockAction?.(action, { block })} />)}</div></section>) : <div style={{ ...adminSurfaceStyle, padding: 16 }}><div style={{ ...adminTextStyle("panelTitle") }}>No appointments this week</div></div>}</div>
    </div>
  );
}
