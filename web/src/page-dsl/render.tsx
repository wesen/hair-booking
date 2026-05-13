import type { CSSProperties, Key, ReactNode } from "react";
import type { DslActionRef, DslNode, DslPage, DslRenderContext, JsonObject, JsonValue } from "./schema";
import { IntakeShell } from "../organisms/IntakeShell/IntakeShell";
import { DesktopShell } from "../organisms/DesktopShell/DesktopShell";
import { Eyebrow } from "../atoms/Eyebrow/Eyebrow";
import { Button } from "../atoms/Button/Button";
import { Chip } from "../atoms/Chip/Chip";
import { ChipGroup } from "../atoms/Chip/ChipGroup";
import { Note } from "../atoms/Note/Note";
import { Card } from "../atoms/Card/Card";
import { Rule } from "../atoms/Rule/Rule";
import { Progress } from "../atoms/Progress/Progress";
import { Segmented } from "../atoms/Segmented/Segmented";
import { Masthead } from "../molecules/Masthead/Masthead";
import { DayCell } from "../molecules/DayCell/DayCell";
import { color, font } from "../fringe-ui/tokens";
import { dslDebug } from "./debug";

function str(props: JsonObject | undefined, key: string, fallback = "") {
  const value = props?.[key];
  return typeof value === "string" ? value : fallback;
}

function num(props: JsonObject | undefined, key: string, fallback = 0) {
  const value = props?.[key];
  return typeof value === "number" ? value : fallback;
}

function bool(props: JsonObject | undefined, key: string, fallback = false) {
  const value = props?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function style(props: JsonObject | undefined): CSSProperties | undefined {
  const value = props?.style;
  return value && typeof value === "object" && !Array.isArray(value) ? value as CSSProperties : undefined;
}

function action(ctx: DslRenderContext | undefined, props: JsonObject | undefined, key = "action", node?: DslNode) {
  const name = str(props, key, "");
  if (!name) return undefined;
  return (value?: unknown, meta?: unknown) => {
    const payload = { node: node as DslNode, action: name, value: value as never, meta };
    const handler = ctx?.actions?.[name];
    if (handler) handler(payload);
    else console.log(`DSL action: ${name}`, payload);
  };
}

function actionRef(props: JsonObject | undefined, eventName: string): DslActionRef | undefined {
  const actions = props?.actions;
  if (!actions || typeof actions !== "object" || Array.isArray(actions)) return undefined;
  const ref = (actions as Record<string, unknown>)[eventName];
  if (!ref || typeof ref !== "object" || Array.isArray(ref)) return undefined;
  const id = (ref as Record<string, unknown>).id;
  const event = (ref as Record<string, unknown>).event;
  if (typeof id !== "string") return undefined;
  return { id, event: typeof event === "string" ? event : eventName };
}

function dispatchAction(
  ctx: DslRenderContext | undefined,
  node: DslNode,
  props: JsonObject | undefined,
  eventName: string,
  localKey: string,
  value?: unknown,
  meta?: unknown,
) {
  const ref = actionRef(props, eventName);
  if (ref && ctx?.backendDispatch) {
    void ctx.backendDispatch({
      nodeId: node.meta?.id || "",
      nodeKind: node.kind,
      actionId: ref.id,
      event: ref.event,
      value: value as JsonValue,
      meta,
    });
    return;
  }
  if (ref && !ctx?.backendDispatch) {
    console.log(`DSL backend action: ${ref.id}`, { node, eventName, value, meta });
    return;
  }
  action(ctx, props, localKey, node)?.(value, meta);
}

function jsonArray<T = unknown>(props: JsonObject | undefined, key: string): T[] {
  const value = props?.[key];
  return Array.isArray(value) ? value as T[] : [];
}

function nullableStr(props: JsonObject | undefined, key: string): string | null {
  const value = props?.[key];
  return typeof value === "string" ? value : null;
}

function dispatchShellAction(
  ctx: DslRenderContext | undefined,
  props: JsonObject | undefined,
  eventName: string,
  localKey: string,
) {
  const ref = actionRef(props, eventName);
  if (ref && ctx?.backendDispatch) {
    void ctx.backendDispatch({
      nodeId: `shell.${eventName}`,
      nodeKind: "intakeShell",
      actionId: ref.id,
      event: ref.event,
    });
    return;
  }
  if (ref && !ctx?.backendDispatch) {
    console.log(`DSL backend shell action: ${ref.id}`, { eventName });
    return;
  }
  action(ctx, props, localKey)?.();
}

function dataAttrs(node: DslNode) {
  return {
    "data-dsl-kind": node.kind,
    "data-dsl-id": node.meta?.id,
    "data-component": node.meta?.dataComponent,
    "data-section": node.meta?.dataSection,
    "data-part": node.meta?.dataPart,
  };
}

function nodeKey(node: DslNode, index: number): Key {
  return node.meta?.id || `${node.kind}:${index}`;
}

function renderChildren(children: DslNode[] | undefined, ctx: DslRenderContext | undefined) {
  return (children || []).map((child, i) => renderNode(child, ctx, nodeKey(child, i)));
}

export function renderNode(node: DslNode, ctx?: DslRenderContext, key?: Key): ReactNode {
  const props = node.props || {};
  const common = dataAttrs(node);

  switch (node.kind) {
    // ── Layout primitives (unchanged) ───────────────────────
    case "text": {
      const variant = str(props, "variant", "body");
      const base: CSSProperties = variant === "editorial"
        ? { fontFamily: font.serif, fontStyle: "italic", fontSize: 17, color: color.softInk, lineHeight: 1.45 }
        : variant === "h3"
          ? { fontFamily: font.block, fontSize: 20, textTransform: "uppercase", lineHeight: 1.05 }
          : { fontFamily: font.sans, fontSize: 14, lineHeight: 1.5, color: color.ink };
      return <div key={key} {...common} style={{ ...base, ...style(props) }}>{str(props, "text")}</div>;
    }
    case "spacer":
      return <div key={key} {...common} style={{ height: num(props, "height", 16), ...style(props) }} />;
    case "stack":
      return <div key={key} {...common} style={{ display: "flex", flexDirection: "column", gap: num(props, "gap", 0), ...style(props) }}>{renderChildren(node.children, ctx)}</div>;
    case "grid": {
      const columns = props.columns || 1;
      const template = typeof columns === "number" ? `repeat(${columns}, 1fr)` : String(columns);
      return <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: template, gap: num(props, "gap", 8), ...style(props) }}>{renderChildren(node.children, ctx)}</div>;
    }

    // ── Display primitives (unchanged) ───────────────────────
    case "eyebrow":
      return <Eyebrow key={key} {...common} color={str(props, "color", undefined as unknown as string)} style={style(props)}>{str(props, "children")}</Eyebrow>;
    case "button":
      return <Button key={key} {...common} variant={str(props, "variant", "primary") as any} size={str(props, "size", "md") as any} onClick={() => dispatchAction(ctx, node, props, "click", "action")} style={style(props)}>{str(props, "children")}</Button>;
    case "note":
      return <Note key={key} {...common} tone={str(props, "tone", "info") as any} style={style(props)}>{str(props, "children")}</Note>;
    case "card":
      return <Card key={key} {...common} accent={str(props, "accent", undefined as unknown as string)} style={style(props)}>{renderChildren(node.children, ctx)}</Card>;
    case "rule":
      return <Rule key={key} {...common} color={str(props, "color", undefined as unknown as string)} thick={bool(props, "thick")} />;
    case "progress":
      return <Progress key={key} {...common} value={num(props, "value")} max={num(props, "max", 100)} color={str(props, "color", undefined as unknown as string)} style={style(props)} />;
    case "masthead":
      return <Masthead key={key} {...common} title={str(props, "title")} eyebrow={str(props, "eyebrow", undefined as unknown as string)} accent={str(props, "accent", undefined as unknown as string)} right={str(props, "right", undefined as unknown as string)} compact={bool(props, "compact")} />;

    // ── Selection primitives (new) ───────────────────────────
    case "selectable": {
      const title = str(props, "title");
      const subtitle = str(props, "subtitle", undefined as unknown as string);
      const badge = str(props, "badge", undefined as unknown as string);
      const selected = bool(props, "selected");
      const disabled = bool(props, "disabled");
      return (
        <div key={key} {...common}
          onClick={disabled ? undefined : () => dispatchAction(ctx, node, props, "change", "action", str(props, "value", title))}
          style={{
            padding: 14, marginBottom: 8, display: "flex", gap: 14, alignItems: "center", cursor: disabled ? "default" : "pointer",
            background: selected ? color.cream : "transparent",
            borderLeft: selected ? `3px solid ${color.plum}` : "3px solid transparent",
            opacity: disabled ? 0.5 : 1,
            ...style(props),
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.block, fontSize: 18, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
            {subtitle && <div style={{ fontFamily: font.sans, fontSize: 12, color: color.soft, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {badge && <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: 1, color: color.plum }}>{badge}</div>}
        </div>
      );
    }
    case "selectableGroup": {
      const options = jsonArray<JsonObject>(props, "options");
      const rawValue = props.value;
      const isMulti = str(props, "mode", "single") === "multiple";
      const columns = num(props, "columns", 1);
      const gap = num(props, "gap", 8);
      const currentValue = isMulti
        ? (Array.isArray(rawValue) ? rawValue as string[] : [])
        : (typeof rawValue === "string" ? rawValue : null);
      return (
        <div key={key} {...common} style={{
          display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap,
          ...style(props),
        }}>
          {options.map((opt, i) => {
            const optTitle = str(opt as any, "title", "");
            const optValue = str(opt as any, "value", optTitle);
            const isSelected = isMulti
              ? (currentValue as string[]).includes(optValue)
              : currentValue === optValue;
            return (
              <div key={i}
                onClick={() => {
                  if (isMulti) {
                    const next = isSelected
                      ? (currentValue as string[]).filter(v => v !== optValue)
                      : [...(currentValue as string[]), optValue];
                    dispatchAction(ctx, node, props, "change", "action", next);
                  } else {
                    dispatchAction(ctx, node, props, "change", "action", optValue);
                  }
                }}
                style={{
                  padding: 14, display: "flex", gap: 14, alignItems: "center", cursor: "pointer",
                  background: isSelected ? color.cream : "transparent",
                  borderLeft: isSelected ? `3px solid ${color.plum}` : "3px solid transparent",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.block, fontSize: 18, textTransform: "uppercase", letterSpacing: 0.5 }}>{optTitle}</div>
                  {str(opt as any, "subtitle", "") && <div style={{ fontFamily: font.sans, fontSize: 12, color: color.soft, marginTop: 2 }}>{str(opt as any, "subtitle", "")}</div>}
                </div>
                {str(opt as any, "badge", "") && <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: 1, color: color.plum }}>{str(opt as any, "badge", "")}</div>}
              </div>
            );
          })}
        </div>
      );
    }
    case "chip":
      return <Chip key={key} {...common} value={str(props, "value", str(props, "children"))} selected={bool(props, "selected")} onSelectedChange={(selected, meta) => dispatchAction(ctx, node, props, "change", "action", selected, meta)} shape={str(props, "shape", "pill") as any} style={style(props)}>{str(props, "children")}</Chip>;
    case "chipGroup":
      return <ChipGroup key={key} {...common} options={jsonArray(props, "options") as any} value={jsonArray(props, "value") as string[]} selectionMode={str(props, "selectionMode", "multiple") as any} label={str(props, "label", undefined as unknown as string)} helperText={str(props, "helperText", undefined as unknown as string)} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "segmented":
      return <Segmented key={key} {...common} options={jsonArray(props, "options") as any} value={str(props, "value")} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;

    // ── Input primitives (new) ───────────────────────────────
    case "scale": {
      const value = num(props, "value", 0);
      const max = num(props, "max", 5);
      const interactive = bool(props, "interactive");
      const label = str(props, "label", undefined as unknown as string);
      const variant = str(props, "variant", "dots");
      if (variant === "swatches") {
        // Color level swatches — rendered inline
        const swatches = ["#1a120c", "#2a1c10", "#3d2a1e", "#5a3e2a", "#7a5638", "#9b7547", "#b89461", "#d1b283", "#e2ce9e", "#ead9af"];
        return (
          <div key={key} {...common} style={{ ...style(props) }}>
            {label && <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: color.plum, marginBottom: 8 }}>{label}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              {swatches.slice(0, max).map((s, i) => (
                <div key={i} onClick={interactive ? () => dispatchAction(ctx, node, props, "change", "action", i + 1) : undefined} style={{
                  width: 28, height: 28, borderRadius: 4, background: s,
                  border: i + 1 === value ? `2px solid ${color.ink}` : "2px solid transparent",
                  cursor: interactive ? "pointer" : "default",
                }} />
              ))}
            </div>
          </div>
        );
      }
      // Dots variant (rating)
      return (
        <div key={key} {...common} style={{ ...style(props) }}>
          {label && <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: color.plum, marginBottom: 8 }}>{label}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: max }, (_, i) => (
              <div key={i} onClick={interactive ? () => dispatchAction(ctx, node, props, "change", "action", i + 1) : undefined} style={{
                width: 12, height: 12, borderRadius: 999,
                background: i < value ? color.plum : color.rule,
                cursor: interactive ? "pointer" : "default",
              }} />
            ))}
          </div>
        </div>
      );
    }
    case "uploadTile": {
      const label = str(props, "label");
      const filled = bool(props, "filled");
      const disabled = bool(props, "disabled");
      return (
        <div key={key} {...common}
          onClick={!disabled ? () => dispatchAction(ctx, node, props, "upload", "onUpload", str(props, "value", label)) : undefined}
          style={{
            aspectRatio: "1", background: filled ? color.cream : "transparent",
            border: `1px dashed ${filled ? color.plum : color.rule}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: disabled ? "default" : "pointer", padding: 8, gap: 4,
            ...style(props),
          }}
        >
          <div style={{ fontFamily: font.block, fontSize: 16, textTransform: "uppercase", color: filled ? color.plum : color.soft }}>{filled ? "✓" : "+"}</div>
          <div style={{ fontFamily: font.mono, fontSize: 9, letterSpacing: 1, color: color.soft }}>{label}</div>
        </div>
      );
    }

    // ── Data display primitives (new) ────────────────────────
    case "kvRow": {
      const label = str(props, "label");
      const value = str(props, "value");
      const editable = bool(props, "editable") || !!actionRef(props, "edit");
      return (
        <div key={key} {...common} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${color.rule}`, ...style(props) }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: color.soft }}>{label}</div>
          <div style={{ fontFamily: font.sans, fontSize: 14, fontWeight: 600, color: color.ink, display: "flex", gap: 8, alignItems: "center" }}>
            {value}
            {editable && <span onClick={() => dispatchAction(ctx, node, props, "edit", "onEdit")} style={{ fontFamily: font.mono, fontSize: 10, color: color.plum, cursor: "pointer" }}>EDIT</span>}
          </div>
        </div>
      );
    }
    case "stat": {
      const value = str(props, "value");
      const label = str(props, "label", undefined as unknown as string);
      const subtitle = str(props, "subtitle", undefined as unknown as string);
      return (
        <div key={key} {...common} style={{ ...style(props) }}>
          {label && <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: color.plumDeep, marginBottom: 8 }}>{label}</div>}
          <div style={{ fontFamily: font.block, fontSize: 48, textTransform: "uppercase", color: color.ink, letterSpacing: -1, lineHeight: 0.9 }}>{value}</div>
          {subtitle && <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 15, color: color.plumDeep, marginTop: 6 }}>{subtitle}</div>}
        </div>
      );
    }
    case "personCard": {
      const name = str(props, "name");
      const role = str(props, "role", undefined as unknown as string);
      const initial = str(props, "initial", name.charAt(0));
      const badge = str(props, "badge", undefined as unknown as string);
      const stats = jsonArray<JsonObject>(props, "stats");
      return (
        <div key={key} {...common} style={{ padding: "14px 18px", background: color.cream, display: "flex", gap: 14, alignItems: "center", ...style(props) }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: color.peachSoft, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.block, fontSize: 22, color: color.plum }}>{initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.block, fontSize: 16, textTransform: "uppercase" }}>{name}</div>
            {role && <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 12, color: color.soft, marginTop: 2 }}>{role}</div>}
            {stats.length > 0 && <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {stats.map((s, i) => <div key={i} style={{ fontFamily: font.mono, fontSize: 10, color: color.soft }}>{str(s as any, "label", "")} {str(s as any, "value", "")}</div>)}
            </div>}
          </div>
          {badge && <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: font.mono, fontSize: 11, color: color.plum }}>{badge}</div>
          </div>}
        </div>
      );
    }

    // ── Date/time primitives ─────────────────────────────────
    case "dayCell":
      return <DayCell key={key} {...common} value={str(props, "value", str(props, "day"))} day={str(props, "day")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} dot={bool(props, "dot")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} />;
    case "calendarGrid": {
      // TODO: implement full month calendar — for now renders compact day grid
      const days = jsonArray(props, "days");
      const value = nullableStr(props, "value");
      return (
        <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: `repeat(${num(props, "columns", 7)}, 1fr)`, gap: 6, ...style(props) }}>
          {days.map((d, i) => {
            const dayStr = str(d as any, "day", str(d as any, "label", String(i + 1)));
            const selected = bool(d as any, "selected");
            const disabled = bool(d as any, "disabled");
            const dot = bool(d as any, "dot");
            return (
              <div key={i}
                onClick={!disabled ? () => dispatchAction(ctx, node, props, "change", "action", str(d as any, "value", dayStr)) : undefined}
                style={{
                  padding: "10px 4px", textAlign: "center", cursor: disabled ? "default" : "pointer",
                  background: selected ? color.plum : "transparent",
                  color: selected ? color.paper : disabled ? color.soft : color.ink,
                  borderRadius: 4, position: "relative",
                }}
              >
                <div style={{ fontFamily: font.block, fontSize: 16, textTransform: "uppercase" }}>{dayStr}</div>
                {dot && <div style={{ width: 4, height: 4, borderRadius: 999, background: selected ? color.paper : color.plum, margin: "4px auto 0" }} />}
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return <pre key={key} {...common}>Unsupported DSL node: {(node as DslNode).kind}</pre>;
  }
}

export function DslPageRenderer({ page, context }: { page: DslPage; context?: DslRenderContext }) {
  const nodeKeys = page.nodes.map((node, i) => String(nodeKey(node, i)));
  dslDebug("DslPageRenderer render", { pageId: page.id, shellKind: page.shell.kind, nodeKeys, shellActions: page.shell.props?.actions });
  const content = <>{page.nodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))}</>;
  if (page.shell.kind === "intake") {
    const props = page.shell.props || {};
    return (
      <IntakeShell
        step={num(props, "step", 1)}
        total={num(props, "total", 9)}
        eyebrow={str(props, "eyebrow", undefined as unknown as string)}
        title={str(props, "title", page.title)}
        titleSize={num(props, "titleSize", 40)}
        nextLabel={str(props, "nextLabel", "Keep going →")}
        onNext={() => dispatchShellAction(context, props, "next", "onNext")}
        onBack={() => dispatchShellAction(context, props, "back", "onBack")}
        onSkip={() => dispatchShellAction(context, props, "skip", "onSkip")}
      >
        {content}
      </IntakeShell>
    );
  }
  if (page.shell.kind === "desktop") {
    const props = page.shell.props || {};
    const accentName = str(props, "accent", "plum");
    const accentMap: Record<string, string> = {
      plum: color.plum, butter: color.butter, sage: color.sage,
      peach: color.peach, coral: color.coral, ochre: color.ochre,
    };
    const accent = accentMap[accentName] || color.plum;
    const accentInkName = str(props, "accentInk", "paper");
    const inkMap: Record<string, string> = {
      paper: color.paper, ink: color.ink, cream: color.cream,
    };
    const accentInk = inkMap[accentInkName] || color.paper;
    return (
      <DesktopShell
        step={num(props, "step", 1)}
        total={num(props, "total", 9)}
        accent={accent}
        accentInk={accentInk}
        activeNav={str(props, "activeNav", "Book")}
        user={(props.user as any) || { name: "Mia", initial: "M" }}
      >
        {content}
      </DesktopShell>
    );
  }
  return <div data-component="DslBarePage" data-page={page.id}>{content}</div>;
}
