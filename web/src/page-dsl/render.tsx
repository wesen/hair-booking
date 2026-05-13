import type { CSSProperties, Key, ReactNode } from "react";
import type { DslActionRef, DslNode, DslPage, DslRenderContext, JsonObject, JsonValue } from "./schema";
import { IntakeShell } from "../organisms/IntakeShell/IntakeShell";
import { Eyebrow } from "../atoms/Eyebrow/Eyebrow";
import { Button } from "../atoms/Button/Button";
import { Chip } from "../atoms/Chip/Chip";
import { ChipGroup } from "../atoms/Chip/ChipGroup";
import { Note } from "../atoms/Note/Note";
import { Card } from "../atoms/Card/Card";
import { Rule } from "../atoms/Rule/Rule";
import { Progress } from "../atoms/Progress/Progress";
import { RatingBar } from "../atoms/RatingBar/RatingBar";
import { Segmented } from "../atoms/Segmented/Segmented";
import { ServiceOption } from "../molecules/ServiceOption/ServiceOption";
import { ServiceOptionGroup } from "../molecules/ServiceOption/ServiceOptionGroup";
import { BudgetOption } from "../molecules/BudgetOption/BudgetOption";
import { BudgetOptionGroup } from "../molecules/BudgetOption/BudgetOptionGroup";
import { TimeSlot } from "../molecules/TimeSlot/TimeSlot";
import { TimeSlotGroup } from "../molecules/TimeSlot/TimeSlotGroup";
import { ColorLevelBar } from "../molecules/ColorLevelBar/ColorLevelBar";
import { LengthSilhouette } from "../molecules/LengthSilhouette/LengthSilhouette";
import { PhotoTile } from "../molecules/PhotoTile/PhotoTile";
import { SummaryRow } from "../molecules/SummaryRow/SummaryRow";
import { StylistCard } from "../molecules/StylistCard/StylistCard";
import { Masthead } from "../molecules/Masthead/Masthead";
import { DayCell } from "../molecules/DayCell/DayCell";
import { DayPickerGrid } from "../molecules/DayCell/DayPickerGrid";
import { color, font } from "../fringe-ui/tokens";

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
    case "eyebrow":
      return <Eyebrow key={key} {...common} color={str(props, "color", undefined as unknown as string)} style={style(props)}>{str(props, "children")}</Eyebrow>;
    case "button":
      return <Button key={key} {...common} variant={str(props, "variant", "primary") as any} size={str(props, "size", "md") as any} onClick={() => dispatchAction(ctx, node, props, "click", "action")} style={style(props)}>{str(props, "children")}</Button>;
    case "chip":
      return <Chip key={key} {...common} value={str(props, "value", str(props, "children"))} selected={bool(props, "selected")} onSelectedChange={(selected, meta) => dispatchAction(ctx, node, props, "change", "action", selected, meta)} shape={str(props, "shape", "pill") as any} style={style(props)}>{str(props, "children")}</Chip>;
    case "chipGroup":
      return <ChipGroup key={key} {...common} options={jsonArray(props, "options") as any} value={jsonArray(props, "value") as string[]} selectionMode={str(props, "selectionMode", "multiple") as any} label={str(props, "label", undefined as unknown as string)} helperText={str(props, "helperText", undefined as unknown as string)} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "note":
      return <Note key={key} {...common} tone={str(props, "tone", "info") as any} style={style(props)}>{str(props, "children")}</Note>;
    case "card":
      return <Card key={key} {...common} accent={str(props, "accent", undefined as unknown as string)} style={style(props)}>{renderChildren(node.children, ctx)}</Card>;
    case "rule":
      return <Rule key={key} {...common} color={str(props, "color", undefined as unknown as string)} thick={bool(props, "thick")} />;
    case "progress":
      return <Progress key={key} {...common} value={num(props, "value")} max={num(props, "max", 100)} color={str(props, "color", undefined as unknown as string)} style={style(props)} />;
    case "ratingBar":
      return <RatingBar key={key} {...common} value={num(props, "value")} max={num(props, "max", 5)} label={str(props, "label", undefined as unknown as string)} color={str(props, "color", undefined as unknown as string)} interactive={bool(props, "interactive")} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "segmented":
      return <Segmented key={key} {...common} options={jsonArray(props, "options") as any} value={str(props, "value")} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "serviceOption":
      return <ServiceOption key={key} {...common} value={str(props, "value", str(props, "name"))} name={str(props, "name")} description={str(props, "description")} rate={str(props, "rate", undefined as unknown as string)} selected={bool(props, "selected")} disabled={bool(props, "disabled")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "serviceOptionGroup":
      return <ServiceOptionGroup key={key} {...common} options={jsonArray(props, "options") as any} value={nullableStr(props, "value")} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "budgetOption":
      return <BudgetOption key={key} {...common} value={str(props, "value", str(props, "label"))} label={str(props, "label")} description={str(props, "description")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "budgetOptionGroup":
      return <BudgetOptionGroup key={key} {...common} options={jsonArray(props, "options") as any} value={nullableStr(props, "value")} columns={num(props, "columns", 1)} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "timeSlot":
      return <TimeSlot key={key} {...common} value={str(props, "value", str(props, "label"))} label={str(props, "label")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "timeSlotGroup":
      return <TimeSlotGroup key={key} {...common} options={jsonArray(props, "options") as any} value={nullableStr(props, "value")} columns={num(props, "columns", 4)} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "colorLevelBar":
      return <ColorLevelBar key={key} {...common} current={num(props, "current", 7)} target={num(props, "target", undefined as unknown as number)} style={style(props)} />;
    case "lengthSilhouette":
      return <LengthSilhouette key={key} {...common} value={str(props, "value", str(props, "label"))} label={str(props, "label")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    case "photoTile":
      return <PhotoTile key={key} {...common} value={str(props, "value", str(props, "label"))} label={str(props, "label")} filled={bool(props, "filled")} disabled={bool(props, "disabled")} onUpload={(value, meta) => dispatchAction(ctx, node, props, "upload", "onUpload", value, meta)} onRemove={(value, meta) => dispatchAction(ctx, node, props, "remove", "onRemove", value, meta)} style={style(props)} />;
    case "summaryRow":
      return <SummaryRow key={key} {...common} label={str(props, "label")} value={str(props, "value")} onEdit={() => dispatchAction(ctx, node, props, "edit", "onEdit")} />;
    case "stylistCard":
      return <StylistCard key={key} {...common} name={str(props, "name")} role={str(props, "role")} rate={str(props, "rate", undefined as unknown as string)} available={str(props, "available", undefined as unknown as string)} style={style(props)} />;
    case "masthead":
      return <Masthead key={key} {...common} title={str(props, "title")} eyebrow={str(props, "eyebrow", undefined as unknown as string)} accent={str(props, "accent", undefined as unknown as string)} right={str(props, "right", undefined as unknown as string)} compact={bool(props, "compact")} />;
    case "dayCell":
      return <DayCell key={key} {...common} value={str(props, "value", str(props, "day"))} day={str(props, "day")} selected={bool(props, "selected")} disabled={bool(props, "disabled")} dot={bool(props, "dot")} onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} />;
    case "dayPickerGrid":
      return <DayPickerGrid key={key} {...common} days={jsonArray(props, "days") as any} value={nullableStr(props, "value")} columns={num(props, "columns", 7)} onChange={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)} style={style(props)} />;
    default:
      return <pre key={key} {...common}>Unsupported DSL node: {(node as DslNode).kind}</pre>;
  }
}

export function DslPageRenderer({ page, context }: { page: DslPage; context?: DslRenderContext }) {
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
  return <div data-component="DslBarePage" data-page={page.id}>{content}</div>;
}
