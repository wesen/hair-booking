import type { CSSProperties, Key, ReactNode } from "react";
import type { DslActionRef, DslNode, DslPage, DslRenderContext, JsonObject, JsonValue } from "./schema";
import { AccentPanel } from "../molecules/AccentPanel/AccentPanel";
import { TwoColumnLayout } from "../organisms/DesktopShell/TwoColumnLayout";
import { IntakeShell } from "../organisms/IntakeShell/IntakeShell";
import { DesktopShell } from "../organisms/DesktopShell/DesktopShell";
import type { DesktopStepRailItem } from "../molecules/DesktopStepRail/DesktopStepRail";
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
import { ServiceOption } from "../molecules/ServiceOption/ServiceOption";
import { BudgetOption } from "../molecules/BudgetOption/BudgetOption";
import { TimeSlot } from "../molecules/TimeSlot/TimeSlot";
import { SummaryRow } from "../molecules/SummaryRow/SummaryRow";
import { StylistCard } from "../molecules/StylistCard/StylistCard";
import { PhotoTile } from "../molecules/PhotoTile/PhotoTile";
import { DayCell } from "../molecules/DayCell/DayCell";
import { DayPickerGrid } from "../molecules/DayCell/DayPickerGrid";
import { ColorLevelBar } from "../molecules/ColorLevelBar/ColorLevelBar";
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
      return <Masthead key={key} {...common} title={str(props, "title")} eyebrow={str(props, "eyebrow", undefined as unknown as string)} accent={str(props, "accent", undefined as unknown as string)} right={str(props, "right", undefined as unknown as string)} compact={bool(props, "compact")} display={bool(props, "display")} style={style(props)} />;

    // ── Selection primitives ───────────────────────────────
    case "selectable": {
      // Render as ServiceOption molecule (maps title→name, subtitle→description, badge→rate)
      return (
        <ServiceOption
          key={key}
          {...common}
          value={str(props, "value", str(props, "title"))}
          name={str(props, "title")}
          description={str(props, "subtitle", "")}
          rate={str(props, "badge", undefined as unknown as string) || undefined}
          selected={bool(props, "selected")}
          disabled={bool(props, "disabled")}
          onSelect={(value) => dispatchAction(ctx, node, props, "change", "action", value)}
          style={style(props)}
        />
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

      // Detect which molecule to use based on option shape:
      // - Options with title + subtitle + badge → ServiceOption (full row, like service selection)
      // - Options with title + subtitle, no badge → BudgetOption (full row with radio, like budget tiers)
      // - Options with title only, columns > 1 → TimeSlot (compact pills in a grid)
      const hasBadges = options.some((opt) => str(opt as any, "badge", ""));
      const hasSubtitles = options.some((opt) => str(opt as any, "subtitle", ""));

      // Full-width rows with badges → ServiceOption
      if (hasBadges) {
        return (
          <div key={key} {...common} style={style(props)}>
            {options.map((opt, i) => {
              const optTitle = str(opt as any, "title", "");
              const optValue = str(opt as any, "value", optTitle);
              const isSelected = isMulti
                ? (currentValue as string[]).includes(optValue)
                : currentValue === optValue;
              return (
                <ServiceOption
                  key={i}
                  value={optValue}
                  name={optTitle}
                  description={str(opt as any, "subtitle", "")}
                  rate={str(opt as any, "badge", undefined as unknown as string) || undefined}
                  selected={isSelected}
                  disabled={bool(opt as any, "disabled")}
                  onSelect={(v) => {
                    if (isMulti) {
                      const next = isSelected
                        ? (currentValue as string[]).filter(x => x !== optValue)
                        : [...(currentValue as string[]), optValue];
                      dispatchAction(ctx, node, props, "change", "action", next);
                    } else {
                      dispatchAction(ctx, node, props, "change", "action", v);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      }

      // Full-width rows with subtitles, no badges → BudgetOption
      if (hasSubtitles && columns <= 1) {
        return (
          <div key={key} {...common} style={style(props)}>
            {options.map((opt, i) => {
              const optTitle = str(opt as any, "title", "");
              const optValue = str(opt as any, "value", optTitle);
              const isSelected = isMulti
                ? (currentValue as string[]).includes(optValue)
                : currentValue === optValue;
              return (
                <BudgetOption
                  key={i}
                  value={optValue}
                  label={optTitle}
                  description={str(opt as any, "subtitle", "")}
                  selected={isSelected}
                  disabled={bool(opt as any, "disabled")}
                  onSelect={(v) => {
                    if (isMulti) {
                      const next = isSelected
                        ? (currentValue as string[]).filter(x => x !== optValue)
                        : [...(currentValue as string[]), optValue];
                      dispatchAction(ctx, node, props, "change", "action", next);
                    } else {
                      dispatchAction(ctx, node, props, "change", "action", v);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      }

      // Grid layout: BudgetOption for items with descriptions, TimeSlot for bare items
      if (columns > 1) {
        if (hasSubtitles) {
          return (
            <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style(props) }}>
              {options.map((opt, i) => {
                const optTitle = str(opt as any, "title", "");
                const optValue = str(opt as any, "value", optTitle);
                const isSelected = isMulti
                  ? (currentValue as string[]).includes(optValue)
                  : currentValue === optValue;
                return (
                  <BudgetOption
                    key={i}
                    value={optValue}
                    label={optTitle}
                    description={str(opt as any, "subtitle", "")}
                    selected={isSelected}
                    disabled={bool(opt as any, "disabled")}
                    onSelect={(v) => {
                      if (isMulti) {
                        const next = isSelected
                          ? (currentValue as string[]).filter(x => x !== optValue)
                          : [...(currentValue as string[]), optValue];
                        dispatchAction(ctx, node, props, "change", "action", next);
                      } else {
                        dispatchAction(ctx, node, props, "change", "action", v);
                      }
                    }}
                  />
                );
              })}
            </div>
          );
        }
        // Bare items in columns → TimeSlot pills
        return (
          <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style(props) }}>
            {options.map((opt, i) => {
              const optTitle = str(opt as any, "title", "");
              const optValue = str(opt as any, "value", optTitle);
              const isSelected = isMulti
                ? (currentValue as string[]).includes(optValue)
                : currentValue === optValue;
              return (
                <TimeSlot
                  key={i}
                  value={optValue}
                  label={optTitle}
                  selected={isSelected}
                  disabled={bool(opt as any, "disabled")}
                  onSelect={(v) => {
                    if (isMulti) {
                      const next = isSelected
                        ? (currentValue as string[]).filter(x => x !== optValue)
                        : [...(currentValue as string[]), optValue];
                      dispatchAction(ctx, node, props, "change", "action", next);
                    } else {
                      dispatchAction(ctx, node, props, "change", "action", v);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      }

      // Fallback: bare items full-width → ServiceOption without badges
      return (
        <div key={key} {...common} style={style(props)}>
          {options.map((opt, i) => {
            const optTitle = str(opt as any, "title", "");
            const optValue = str(opt as any, "value", optTitle);
            const isSelected = isMulti
              ? (currentValue as string[]).includes(optValue)
              : currentValue === optValue;
            return (
              <ServiceOption
                key={i}
                value={optValue}
                name={optTitle}
                description={str(opt as any, "subtitle", "")}
                selected={isSelected}
                disabled={bool(opt as any, "disabled")}
                onSelect={(v) => {
                  if (isMulti) {
                    const next = isSelected
                          ? (currentValue as string[]).filter(x => x !== optValue)
                          : [...(currentValue as string[]), optValue];
                    dispatchAction(ctx, node, props, "change", "action", next);
                  } else {
                    dispatchAction(ctx, node, props, "change", "action", v);
                  }
                }}
              />
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

    // ── Input primitives ───────────────────────────────────
    case "scale": {
      const value = num(props, "value", 0);
      const max = num(props, "max", 5);
      const interactive = bool(props, "interactive");
      const label = str(props, "label", undefined as unknown as string);
      const variant = str(props, "variant", "dots");
      if (variant === "swatches") {
        // Use ColorLevelBar molecule for swatches
        return (
          <div key={key} {...common} style={{ ...style(props) }}>
            {label && <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: color.plum, marginBottom: 8 }}>{label}</div>}
            <ColorLevelBar current={value} target={num(props, "target", undefined as unknown as number)} />
          </div>
        );
      }
      // Dots variant (rating) — inline since there's no molecule for this
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
      // Use PhotoTile molecule
      return (
        <PhotoTile
          key={key}
          {...common}
          value={str(props, "value", str(props, "label"))}
          label={str(props, "label")}
          filled={bool(props, "filled")}
          disabled={bool(props, "disabled")}
          onUpload={(value) => dispatchAction(ctx, node, props, "upload", "action", value)}
          onRemove={(value) => dispatchAction(ctx, node, props, "remove", "action", value)}
          style={style(props)}
        />
      );
    }

    // ── Data display primitives ──────────────────────────────
    case "kvRow": {
      // Use SummaryRow molecule
      const editable = bool(props, "editable") || !!actionRef(props, "edit");
      const inContext = node.meta?.region === "context";
      return (
        <SummaryRow
          key={key}
          {...common}
          label={str(props, "label")}
          value={str(props, "value")}
          onEdit={editable && !inContext ? () => dispatchAction(ctx, node, props, "edit", "onEdit") : undefined}
          accent={inContext}
          style={style(props)}
        />
      );
    }
    case "stat": {
      // Hero number with optional mono label and serif subtitle
      const value = str(props, "value");
      const label = str(props, "label", undefined as unknown as string);
      const subtitle = str(props, "subtitle", undefined as unknown as string);
      const size = str(props, "size", "lg");
      const fontSize = size === "display" ? 180 : size === "xl" ? 72 : size === "md" ? 36 : 56;
      const labelSize = size === "display" ? 12 : 10;
      const subtitleSize = size === "display" ? 22 : 16;
      const tracking = size === "display" ? -6 : -0.5;
      return (
        <div key={key} {...common} style={{ ...style(props) }}>
          {label && <div style={{ fontFamily: font.mono, fontSize: labelSize, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 600, color: color.plumDeep, marginBottom: size === "display" ? 14 : 8 }}>{label}</div>}
          <div style={{ fontFamily: font.block, fontSize, textTransform: "uppercase", color: color.ink, letterSpacing: tracking, lineHeight: size === "display" ? 0.82 : 0.9 }}>{value}</div>
          {subtitle && <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: subtitleSize, color: color.softInk, marginTop: size === "display" ? 12 : 8, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
      );
    }
    case "personCard": {
      // Use StylistCard molecule
      return (
        <StylistCard
          key={key}
          {...common}
          name={str(props, "name")}
          role={str(props, "role", "")}
          rate={str(props, "badge", undefined as unknown as string) || undefined}
          available={str(props, "available", undefined as unknown as string) || undefined}
          style={style(props)}
        />
      );
    }

    // ── Date/time primitives ─────────────────────────────────
    case "dayCell":
      return <DayCell key={key} {...common} value={str(props, "value", str(props, "day"))} day={str(props, "day")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} dot={bool(props, "dot")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} />;
    case "calendarGrid": {
      // Use DayPickerGrid molecule wrapping DayCell components
      const days = jsonArray<JsonObject>(props, "days").map((d) => {
        const dayStr = str(d as any, "day", "");
        const dateStr = str(d as any, "date", dayStr);
        return {
          value: str(d as any, "value", dateStr),
          day: dayStr,
          disabled: bool(d as any, "disabled"),
          disabledReason: str(d as any, "disabledReason", undefined as unknown as string) || undefined,
          dot: bool(d as any, "dot"),
        };
      });
      return (
        <DayPickerGrid
          key={key}
          {...common}
          days={days as any}
          value={nullableStr(props, "value")}
          onChange={(value) => dispatchAction(ctx, node, props, "change", "action", value)}
          columns={num(props, "columns", 7)}
          gap={num(props, "gap", 4)}
          showWeekdays={bool(props, "showWeekdays", true)}
          monthLabel={str(props, "monthLabel", undefined as unknown as string) || undefined}
          style={style(props)}
        />
      );
    }
    default:
      return <pre key={key} {...common}>Unsupported DSL node: {(node as DslNode).kind}</pre>;
  }
}

/**
 * Partition DSL nodes into main content and context-panel content for desktop.
 * Context-panel candidates: stat, personCard, kvRow (with meta.context=true), card with accent.
 * Everything else goes to main.
 */
/** Parse shell.props.steps into DesktopStepRailItem[] for the step rail. */
function parseShellSteps(props: JsonObject | undefined): DesktopStepRailItem[] {
  const raw = props?.steps;
  if (!Array.isArray(raw)) return [];
  return raw.map((s): DesktopStepRailItem => {
    const obj = (s && typeof s === "object" && !Array.isArray(s)) ? s as Record<string, unknown> : {};
    return {
      id: typeof obj.id === "string" ? obj.id : String(obj.label || ""),
      label: typeof obj.label === "string" ? obj.label : "",
      disabled: typeof obj.disabled === "boolean" ? obj.disabled : false,
    };
  });
}

function partitionForDesktop(nodes: DslNode[]): { mainNodes: DslNode[]; contextNodes: DslNode[] } {
  const CONTEXT_KINDS = new Set(["stat", "personCard"]);
  const mainNodes: DslNode[] = [];
  const contextNodes: DslNode[] = [];

  for (const node of nodes) {
    // Explicit meta.region = "context" always pulls to context panel
    if (node.meta?.region === "context") {
      contextNodes.push(node);
      continue;
    }
    // Explicit meta.region = "main" always stays in main
    if (node.meta?.region === "main") {
      mainNodes.push(node);
      continue;
    }
    // Automatic: stat and personCard go to context panel
    if (CONTEXT_KINDS.has(node.kind)) {
      contextNodes.push(node);
      continue;
    }
    // kvRow nodes in a card get pulled to context if the card has no explicit region
    // (We don't split card children — cards go to main unless meta.region = "context")
    // Everything else is main content
    mainNodes.push(node);
  }

  return { mainNodes, contextNodes };
}

export interface DslPageRendererProps {
  page: DslPage;
  context?: DslRenderContext;
  /** When true, override shell.kind "intake" → render as desktop two-column layout */
  forceDesktop?: boolean;
}

export function DslPageRenderer({ page, context, forceDesktop }: DslPageRendererProps) {
  const nodeKeys = page.nodes.map((node, i) => String(nodeKey(node, i)));
  const effectiveKind = forceDesktop && page.shell.kind === "intake" ? "desktop" : page.shell.kind;
  dslDebug("DslPageRenderer render", { pageId: page.id, shellKind: page.shell.kind, effectiveKind, forceDesktop, nodeKeys, shellActions: page.shell.props?.actions });
  const content = <>{page.nodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))}</>;
  if (effectiveKind === "intake") {
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
  if (effectiveKind === "desktop") {
    const props = page.shell.props || {};
    // When forceDesktop, infer desktop accent from page title/step for visual variety
    const stepNum = num(page.shell.props || {}, "step", 1);
    const accentName = str(props, "accent", stepNum >= 5 ? "butter" : "plum");
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

    // Desktop navigation bar (mirrors IntakeShell's bottom CTA)
    const nextLabel = str(props, "nextLabel", "Keep going →");
    const hasBack = !!actionRef(props, "back");
    const hasNext = !!actionRef(props, "next");
    const hasSkip = !!actionRef(props, "skip");
    const desktopNavBar = (hasNext || hasBack || hasSkip) ? (
      <div data-component="DesktopNavBar" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        padding: "18px 56px",
        borderTop: `1px solid ${color.rule}`,
        background: color.paper,
      }}>
        {hasSkip && (
          <button type="button" onClick={() => dispatchShellAction(context, props, "skip", "onSkip")} style={{
            border: "none",
            background: "transparent",
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: color.softInk,
            cursor: "pointer",
            padding: "8px 16px",
          }}>Skip</button>
        )}
        {hasBack && (
          <button type="button" onClick={() => dispatchShellAction(context, props, "back", "onBack")} style={{
            border: `1px solid ${color.ink}`,
            background: "transparent",
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: color.ink,
            cursor: "pointer",
            padding: "10px 24px",
            borderRadius: 999,
          }}>Back</button>
        )}
        {hasNext && (
          <button type="button" onClick={() => dispatchShellAction(context, props, "next", "onNext")} style={{
            border: "none",
            background: color.ink,
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: color.paper,
            cursor: "pointer",
            padding: "10px 28px",
            borderRadius: 999,
          }}>{nextLabel}</button>
        )}
      </div>
    ) : null;

    // Desktop two-column partition: pull context nodes into right-side accent panel
    const { mainNodes, contextNodes } = partitionForDesktop(page.nodes);
    const mainContent = <>{mainNodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))}</>;

    // Parse step items with actions for clickable navigation
    const shellSteps = parseShellSteps(props);
    const shellStepActions = (() => {
      const raw = props?.steps;
      if (!Array.isArray(raw)) return [];
      return raw.map((s) => {
        const obj = (s && typeof s === "object" && !Array.isArray(s)) ? s as Record<string, unknown> : {};
        const actions = obj.actions as Record<string, unknown> | undefined;
        const select = actions?.select as Record<string, unknown> | undefined;
        return select ? { id: typeof select.id === "string" ? select.id : "", event: typeof select.event === "string" ? select.event : "goto" } : null;
      });
    })();

    // Shared shell wrapper with navbar
    const renderDesktopContent = (inner: ReactNode) => (
      <DesktopShell
        step={stepNum - 1}
        total={num(props, "total", 7)}
        stepItems={shellSteps.length > 0 ? shellSteps : undefined}
        onStepSelect={shellStepActions.some(a => a !== null) ? (step, index) => {
          const actionRef = shellStepActions[index];
          if (!actionRef || !actionRef.id) return;
          void context?.backendDispatch?.({
            nodeId: `shell.step.${step.id}`,
            nodeKind: "intakeShell",
            actionId: actionRef.id,
            event: actionRef.event,
            value: step.id,
          });
        } : undefined}
        accent={accent}
        accentInk={accentInk}
        activeNav={str(props, "activeNav", "Book")}
        user={(props.user as any) || { name: "Mia", initial: "M" }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div data-component="DesktopContent" style={{ flex: 1, overflow: "auto", padding: "48px 56px" }}>
            {inner}
          </div>
          {desktopNavBar}
        </div>
      </DesktopShell>
    );

    if (contextNodes.length > 0) {
      const contextContent = (
        <AccentPanel accent={accent} accentInk={accentInk}>
          {contextNodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))}
        </AccentPanel>
      );
      return renderDesktopContent(
        <TwoColumnLayout leftWidth="1.15fr" rightWidth="1fr" gap={32} left={mainContent} right={contextContent} />
      );
    }

    return renderDesktopContent(mainContent);
  }
  return <div data-component="DslBarePage" data-page={page.id}>{content}</div>;
}
