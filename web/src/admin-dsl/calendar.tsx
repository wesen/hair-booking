import type { Key } from "react";
import type { AdminActionRef, AdminJsonObject, AdminNode, AdminRenderContext } from "./schema";
import { color, radius, shadow, type } from "../fringe-ui/tokens";

function str(props: AdminJsonObject | undefined, key: string, fallback = "") {
  const value = props?.[key];
  return typeof value === "string" ? value : fallback;
}

function num(props: AdminJsonObject | undefined, key: string, fallback = 0) {
  const value = props?.[key];
  return typeof value === "number" ? value : fallback;
}

function jsonArray<T = unknown>(props: AdminJsonObject | undefined, key: string): T[] {
  const value = props?.[key];
  return Array.isArray(value) ? value as T[] : [];
}

function style(props: AdminJsonObject | undefined) {
  const value = props?.style;
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function isActionRef(item: unknown): item is AdminActionRef {
  return !!item && typeof item === "object" && !Array.isArray(item) && typeof (item as { type?: unknown }).type === "string";
}

function actionList(props: AdminJsonObject | undefined): AdminActionRef[] {
  const value = props?.actions;
  if (Array.isArray(value)) return value.filter(isActionRef);
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.values(value).filter(isActionRef);
  return [];
}

function dataAttrs(node: AdminNode) {
  return {
    "data-admin-dsl-kind": node.kind,
    "data-admin-dsl-id": node.meta?.id || str(node.props, "id", undefined as unknown as string),
    "data-section": node.meta?.dataSection,
    "data-part": node.meta?.dataPart,
  };
}

function nodeKey(node: AdminNode, index: number): Key {
  return node.meta?.id || str(node.props, "id", `${node.kind}:${index}`);
}

function dispatch(ctx: AdminRenderContext | undefined, node: AdminNode, actionRef: AdminActionRef, value?: unknown, meta?: unknown) {
  if (ctx?.dispatch) {
    void ctx.dispatch({
      nodeId: node.meta?.id || str(node.props, "id", ""),
      nodeKind: node.kind,
      action: actionRef,
      value: value as never,
      meta,
    });
    return;
  }
  console.log("Admin DSL action", { node, action: actionRef, value, meta });
}

const surface = {
  background: color.paper,
  border: `1px solid ${color.rule}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
};

function hourLabelToHour(label: string): number | null {
  const match = label.trim().toLowerCase().match(/^(\d{1,2})(?::\d{2})?\s*([ap])?/);
  if (!match) return null;
  let hour = Number(match[1]);
  const meridiem = match[2];
  if (meridiem === "p" && hour < 12) hour += 12;
  if (meridiem === "a" && hour === 12) hour = 0;
  return Number.isFinite(hour) ? hour : null;
}

function rowForStartTime(startsAt: string, hours: string[]) {
  const startHour = hourLabelToHour(startsAt);
  if (startHour == null) return 1;
  const index = hours.findIndex((hour) => hourLabelToHour(hour) === startHour);
  return index >= 0 ? index + 1 : 1;
}

function renderCalendarBlock(node: AdminNode, ctx: AdminRenderContext | undefined, dayCount: number, hours: string[], key: Key) {
  const props = node.props || {};
  const column = Math.min(Math.max(num(props, "column", 1), 1), Math.max(dayCount, 1));
  const row = Math.min(Math.max(num(props, "row", rowForStartTime(str(props, "startsAt"), hours)), 1), Math.max(hours.length, 1));
  const span = Math.min(Math.max(num(props, "span", 1), 1), Math.max(hours.length - row + 1, 1));
  const isTimeOff = node.kind === "timeOffBlock";

  return (
    <button
      key={key}
      {...dataAttrs(node)}
      type="button"
      onClick={() => actionList(props)[0] && dispatch(ctx, node, actionList(props)[0])}
      style={{
        gridColumn: column,
        gridRow: `${row} / span ${span}`,
        zIndex: 1,
        alignSelf: "stretch",
        justifySelf: "stretch",
        margin: 6,
        minHeight: 44,
        textAlign: "left",
        border: `1px solid ${isTimeOff ? color.warn : color.plum}`,
        background: isTimeOff ? "#fbefcf" : color.paper,
        borderRadius: radius.md,
        padding: 10,
        boxShadow: shadow.sm,
        cursor: actionList(props).length ? "pointer" : "default",
        overflow: "hidden",
        ...style(props),
      }}
    >
      <strong style={{ ...type.bodySm, fontWeight: 800, display: "block" }}>{str(props, "clientName", str(props, "title", "Appointment"))}</strong>
      <span style={{ ...type.bodySm, color: color.softInk, display: "block" }}>{str(props, "service", str(props, "status"))}</span>
      <span style={{ ...type.meta, display: "block", marginTop: 6 }}>{str(props, "startsAt")} – {str(props, "endsAt")}</span>
    </button>
  );
}

function renderCalendarAgendaItem(node: AdminNode, ctx: AdminRenderContext | undefined, key: Key) {
  const props = node.props || {};
  const isTimeOff = node.kind === "timeOffBlock";
  return (
    <button
      key={key}
      {...dataAttrs(node)}
      type="button"
      onClick={() => actionList(props)[0] && dispatch(ctx, node, actionList(props)[0])}
      style={{
        minHeight: 58,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "86px 1fr",
        gap: 12,
        alignItems: "center",
        textAlign: "left",
        border: `1px solid ${isTimeOff ? color.warn : color.plum}`,
        borderLeft: `4px solid ${isTimeOff ? color.warn : color.plum}`,
        background: isTimeOff ? "#fbefcf" : color.paper,
        borderRadius: radius.md,
        padding: 12,
        boxShadow: shadow.sm,
        cursor: actionList(props).length ? "pointer" : "default",
        ...style(props),
      }}
    >
      <span style={{ ...type.meta, color: color.ink }}>{str(props, "startsAt")}<br />{str(props, "endsAt")}</span>
      <span>
        <strong style={{ ...type.body, fontWeight: 800, display: "block" }}>{str(props, "clientName", str(props, "title", "Appointment"))}</strong>
        <span style={{ ...type.bodySm, color: color.softInk, display: "block", marginTop: 2 }}>{str(props, "service", str(props, "status"))}</span>
      </span>
    </button>
  );
}

function renderCalendarAgenda(nodes: AdminNode[], ctx: AdminRenderContext | undefined, days: string[]) {
  const groups = days.map((day, dayIndex) => ({
    day,
    nodes: nodes.filter((node) => Math.min(Math.max(num(node.props, "column", 1), 1), Math.max(days.length, 1)) === dayIndex + 1),
  })).filter((group) => group.nodes.length > 0);

  if (!groups.length) {
    return (
      <div className="adminDslCalendarAgenda" style={{ ...surface, padding: 16, display: "none" }}>
        <div style={{ ...type.h3 }}>No appointments this week</div>
      </div>
    );
  }

  return (
    <div className="adminDslCalendarAgenda" style={{ display: "none", gap: 12 }}>
      {groups.map((group) => (
        <section key={group.day} style={{ ...surface, padding: 14 }}>
          <h3 style={{ ...type.h3, margin: "0 0 12px" }}>{group.day}</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {group.nodes.map((node, i) => renderCalendarAgendaItem(node, ctx, nodeKey(node, i)))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function AdminCalendarWeek({ node, context, attrs }: { node: AdminNode; context?: AdminRenderContext; attrs?: Record<string, unknown> }) {
  const props = node.props || {};
  const days = jsonArray<string>(props, "days");
  const hours = jsonArray<string>(props, "hours");

  return (
    <div {...attrs} style={style(props)}>
      <div className="adminDslCalendarScroller" style={{ ...surface, overflowX: "auto", overflowY: "hidden" }}>
        <div className="adminDslCalendarInner" style={{ minWidth: 620 }}>
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${Math.max(days.length, 1)}, 1fr)`, borderBottom: `1px solid ${color.rule}` }}>
            <div />
            {days.map((day) => <div key={day} style={{ ...type.meta, padding: 12, textAlign: "center", borderLeft: `1px solid ${color.rule}` }}>{day}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", minHeight: 420 }}>
            <div style={{ display: "grid", gridTemplateRows: `repeat(${hours.length}, minmax(58px, 1fr))` }}>
              {hours.map((hour) => <div key={hour} style={{ ...type.meta, color: color.soft, padding: 8, borderBottom: `1px solid ${color.ruleSoft}` }}>{hour}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(96px, 1fr))`, gridTemplateRows: `repeat(${hours.length}, minmax(58px, 1fr))`, background: color.cream }}>
              {days.flatMap((day, dayIndex) => hours.map((hour, hourIndex) => (
                <div key={`${day}:${hour}`} style={{ gridColumn: dayIndex + 1, gridRow: hourIndex + 1, borderLeft: `1px solid ${color.ruleSoft}`, borderBottom: `1px solid ${color.ruleSoft}` }} />
              )))}
              {(node.children || []).map((child, i) => renderCalendarBlock(child, context, days.length, hours, nodeKey(child, i)))}
            </div>
          </div>
        </div>
      </div>
      {renderCalendarAgenda(node.children || [], context, days)}
    </div>
  );
}
