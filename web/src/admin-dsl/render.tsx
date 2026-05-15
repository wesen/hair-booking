import type { CSSProperties, Key, ReactNode } from "react";
import type { AdminActionRef, AdminJsonObject, AdminNode, AdminPage, AdminRenderContext } from "./schema";
import { color, font, radius, shadow, type } from "../fringe-ui/tokens";
import { AdminCalendarWeek } from "./calendar";

function str(props: AdminJsonObject | undefined, key: string, fallback = "") {
  const value = props?.[key];
  return typeof value === "string" ? value : fallback;
}

function num(props: AdminJsonObject | undefined, key: string, fallback = 0) {
  const value = props?.[key];
  return typeof value === "number" ? value : fallback;
}

function bool(props: AdminJsonObject | undefined, key: string, fallback = false) {
  const value = props?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function jsonArray<T = unknown>(props: AdminJsonObject | undefined, key: string): T[] {
  const value = props?.[key];
  return Array.isArray(value) ? value as T[] : [];
}

function jsonObject(props: AdminJsonObject | undefined, key: string): AdminJsonObject | undefined {
  const value = props?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as AdminJsonObject : undefined;
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

function style(props: AdminJsonObject | undefined): CSSProperties | undefined {
  const value = props?.style;
  return value && typeof value === "object" && !Array.isArray(value) ? value as CSSProperties : undefined;
}

function toneColor(tone: string) {
  switch (tone) {
    case "success": return color.success;
    case "warn": return color.warn;
    case "danger": return color.danger;
    case "plum": return color.plum;
    case "muted": return color.soft;
    default: return color.ink;
  }
}

function nodeKey(node: AdminNode, index: number): Key {
  return node.meta?.id || str(node.props, "id", `${node.kind}:${index}`);
}

function dataAttrs(node: AdminNode) {
  return {
    "data-admin-dsl-kind": node.kind,
    "data-admin-dsl-id": node.meta?.id || str(node.props, "id", undefined as unknown as string),
    "data-section": node.meta?.dataSection,
    "data-part": node.meta?.dataPart,
  };
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

function renderActions(node: AdminNode, ctx: AdminRenderContext | undefined, actions: AdminActionRef[] = actionList(node.props)) {
  if (!actions.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {actions.map((actionRef, i) => (
        <button
          key={`${actionRef.type}:${actionRef.target}:${i}`}
          className="adminDslActionButton"
          type="button"
          onClick={() => dispatch(ctx, node, actionRef)}
          style={{ minHeight: 38,
            border: `1px solid ${actionRef.type === "confirm" ? color.danger : color.ink}`,
            background: actionRef.type === "mutation" || actionRef.type === "open" ? color.ink : color.paper,
            color: actionRef.type === "mutation" || actionRef.type === "open" ? color.paper : actionRef.type === "confirm" ? color.danger : color.ink,
            borderRadius: radius.pill,
            padding: "8px 12px",
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {actionRef.label || actionRef.target}
        </button>
      ))}
    </div>
  );
}

function renderChildren(children: AdminNode[] | undefined, ctx: AdminRenderContext | undefined) {
  return (children || []).map((child, i) => renderAdminNode(child, ctx, nodeKey(child, i)));
}

const surface: CSSProperties = {
  background: color.paper,
  border: `1px solid ${color.rule}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
};

export function renderAdminNode(node: AdminNode, ctx?: AdminRenderContext, key?: Key): ReactNode {
  const props = node.props || {};
  const common = dataAttrs(node);

  switch (node.kind) {
    case "toolbar":
      return <div key={key} {...common} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22, ...style(props) }}>{renderActions(node, ctx)}</div>;

    case "section":
      return (
        <section key={key} {...common} style={{ marginBottom: 28, ...style(props) }}>
          <div style={{ marginBottom: 14 }}>
            <h2 className="adminDslSectionTitle" style={{ ...type.h2, margin: 0 }}>{str(props, "title")}</h2>
            {str(props, "description") && <p style={{ ...type.body, color: color.softInk, margin: "8px 0 0" }}>{str(props, "description")}</p>}
          </div>
          <div style={{ display: "grid", gap: 14 }}>{renderChildren(node.children, ctx)}</div>
        </section>
      );

    case "cardGrid":
      return <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24, ...style(props) }}>{renderChildren(node.children, ctx)}</div>;

    case "splitPane":
      return <div key={key} {...common} className="adminDslSplitPane" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.85fr) minmax(320px, 1.15fr)", gap: 16, alignItems: "start", ...style(props) }}>{renderChildren(node.children, ctx)}</div>;

    case "tabs": {
      const tabs = jsonArray<AdminJsonObject>(props, "tabs");
      const value = str(props, "value");
      return <div key={key} {...common} style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style(props) }}>{tabs.map((tab) => { const active = tab.id === value; return <span key={String(tab.id)} className="adminDslFilterPill" style={{ minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta }}>{String(tab.label || tab.id)}</span>; })}</div>;
    }

    case "searchBox":
      return <div key={key} {...common} style={{ ...surface, padding: 12, display: "flex", alignItems: "center", gap: 10, color: color.softInk, ...style(props) }}><span style={{ ...type.meta }}>Search</span><span style={{ ...type.body, color: color.soft }}>{str(props, "placeholder", "Search")}</span></div>;

    case "panel":
    case "summaryCard":
      return (
        <article key={key} {...common} style={{ ...surface, padding: 18, ...style(props) }}>
          <h3 style={{ ...type.h3, margin: 0 }}>{str(props, "title")}</h3>
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk, margin: "10px 0 14px" }}>{str(props, "body")}</p>}
          {renderChildren(node.children, ctx)}
          {renderActions(node, ctx)}
        </article>
      );

    case "metricCard":
      return (
        <article key={key} {...common} style={{ ...surface, padding: 18, borderTop: `4px solid ${toneColor(str(props, "tone"))}`, ...style(props) }}>
          <div style={{ ...type.eyebrow, color: color.softInk }}>{str(props, "label")}</div>
          <div style={{ ...type.display3, marginTop: 10, color: toneColor(str(props, "tone")) }}>{String(props.value || "—")}</div>
          {str(props, "caption") && <div style={{ ...type.bodySm, color: color.softInk, marginTop: 8 }}>{str(props, "caption")}</div>}
        </article>
      );

    case "filterBar": {
      const filters = jsonArray<AdminJsonObject>(props, "filters");
      const value = str(props, "value");
      return (
        <div key={key} {...common} style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style(props) }}>
          {filters.map((filter) => {
            const active = filter.id === value;
            return <span key={String(filter.id)} className="adminDslFilterPill" style={{ minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta }}>{String(filter.label || filter.id)}</span>;
          })}
        </div>
      );
    }

    case "resourceList":
      return (
        <div key={key} {...common} style={{ display: "grid", gap: 10, ...style(props) }}>
          {node.children?.length ? renderChildren(node.children, ctx) : renderInlineNode(jsonObject(props, "empty"), ctx)}
        </div>
      );

    case "resourceRow":
      return (
        <article key={key} {...common} className="adminDslResourceRow" style={{ ...surface, padding: 16, display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center", ...style(props) }}> 
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h3 style={{ ...type.h3, margin: 0 }}>{str(props, "title", str(props, "id"))}</h3>
              {str(props, "badge") && <span style={{ borderRadius: radius.pill, padding: "4px 8px", background: color.paper, border: `1px solid ${color.rule}`, color: toneColor(str(props, "tone")), fontWeight: 700, ...type.meta }}>{str(props, "badge")}</span>}
            </div>
            {str(props, "subtitle") && <p style={{ ...type.bodySm, color: color.softInk, margin: "8px 0 0" }}>{str(props, "subtitle")}</p>}
            {str(props, "description") && <p style={{ ...type.body, color: color.softInk, margin: "8px 0 0" }}>{str(props, "description")}</p>}
          </div>
          {renderActions(node, ctx)}
        </article>
      );

    case "emptyState":
      return (
        <div key={key} {...common} style={{ ...surface, padding: 28, textAlign: "center", background: color.cream, ...style(props) }}>
          <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title", "Nothing here yet")}</h3>
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk, maxWidth: 420, margin: "10px auto 18px" }}>{str(props, "body")}</p>}
          {jsonObject(props, "action") && renderActions(node, ctx, [jsonObject(props, "action") as unknown as AdminActionRef])}
        </div>
      );

    case "kvList": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return (
        <dl key={key} {...common} style={{ display: "grid", gap: 10, margin: 0, ...style(props) }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, borderBottom: `1px solid ${color.ruleSoft}`, paddingBottom: 8 }}>
              <dt style={{ ...type.meta, color: color.soft }}>{String(item.label || "")}</dt>
              <dd style={{ ...type.body, margin: 0 }}>{String(item.value || "")}</dd>
            </div>
          ))}
        </dl>
      );
    }

    case "markdownBlock":
      return <p key={key} {...common} style={{ ...type.body, color: color.softInk, margin: 0, whiteSpace: "pre-wrap", ...style(props) }}>{str(props, "markdown")}</p>;

    case "activityFeed": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return <div key={key} {...common} style={{ display: "grid", gap: 10, ...style(props) }}>{items.map((item, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, paddingBottom: 10, borderBottom: `1px solid ${color.ruleSoft}` }}><div style={{ ...type.meta, color: color.softInk }}>{String(item.time || "")}</div><div><div style={{ ...type.body, fontWeight: 800 }}>{String(item.title || "")}</div>{item.body && <div style={{ ...type.bodySm, color: color.softInk, marginTop: 2 }}>{String(item.body)}</div>}</div></div>)}</div>;
    }

    case "imageGrid": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, ...style(props) }}>{items.map((item) => <article key={String(item.id || item.title)} style={{ ...surface, overflow: "hidden" }}><div style={{ aspectRatio: "4 / 3", background: `linear-gradient(135deg, ${color.peachSoft}, ${color.creamDeep})`, borderBottom: `1px solid ${color.rule}` }} /><div style={{ padding: 12 }}><div style={{ ...type.h3, fontSize: 18 }}>{String(item.title || "Asset")}</div><div style={{ ...type.bodySm, color: color.softInk, marginTop: 4 }}>{String(item.subtitle || "")}</div>{item.status && <span style={{ display: "inline-flex", marginTop: 8, borderRadius: radius.pill, padding: "4px 8px", background: color.paper, border: `1px solid ${color.rule}`, color: toneColor(String(item.tone || "")), fontWeight: 700, ...type.meta }}>{String(item.status)}</span>}</div></article>)}</div>;
    }

    case "loadingState":
      return <div key={key} {...common} style={{ ...surface, padding: 16, display: "grid", gap: 8, ...style(props) }}><div style={{ ...type.h3 }}>{str(props, "title", "Loading")}</div>{str(props, "body") && <p style={{ ...type.bodySm, color: color.softInk, margin: 0 }}>{str(props, "body")}</p>}<div style={{ height: 8, borderRadius: radius.pill, background: `linear-gradient(90deg, ${color.rule}, ${color.cream}, ${color.rule})` }} /></div>;

    case "modal":
    case "drawer": {
      const isDrawer = node.kind === "drawer";
      return (
        <aside key={key} {...common} className={`adminDslOverlaySurface ${isDrawer ? "adminDslDrawerSurface" : "adminDslModalSurface"}`} style={{ ...surface, padding: 18, background: isDrawer ? color.cream : color.paper, borderStyle: bool(props, "open", false) ? "solid" : "dashed", ...style(props) }}>
          <div className="adminDslSurfaceKicker" style={{ ...type.eyebrow, color: color.softInk }}>{isDrawer ? "Drawer" : "Modal"}</div>
          <h3 style={{ ...type.h2, margin: "8px 0 16px" }}>{str(props, "title", str(props, "id"))}</h3>
          <div style={{ display: "grid", gap: 14 }}>{renderChildren(node.children, ctx)}</div>
        </aside>
      );
    }

    case "confirmDialog":
      return (
        <aside key={key} {...common} style={{ ...surface, padding: 18, borderColor: str(props, "tone") === "danger" ? color.danger : color.rule, ...style(props) }}>
          <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title", "Are you sure?")}</h3>
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk }}>{str(props, "body")}</p>}
          {renderActions(node, ctx, [{ type: "confirm", target: str(props, "id"), label: str(props, "confirmLabel", "Confirm") }])}
        </aside>
      );

    case "form":
      return (
        <form key={key} {...common} style={{ display: "grid", gap: 16, ...style(props) }} onSubmit={(event) => event.preventDefault()}>
          {str(props, "title") && <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title")}</h3>}
          {renderChildren(node.children, ctx)}
        </form>
      );

    case "fieldGroup":
      return <fieldset key={key} {...common} style={{ border: `1px solid ${color.rule}`, borderRadius: radius.md, padding: 14, display: "grid", gap: 12, ...style(props) }}><legend style={{ ...type.eyebrow }}>{str(props, "title")}</legend>{renderChildren(node.children, ctx)}</fieldset>;

    case "textField":
    case "textareaField":
    case "moneyField":
    case "durationField":
    case "dateField":
    case "timeField":
    case "selectField":
    case "switchField":
    case "imageField":
      return <FieldPreview key={key} node={node} />;

    case "saveBar":
      return <div key={key} {...common} className="adminDslSaveBar" style={{ borderTop: `1px solid ${color.rule}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, ...style(props) }}><span className="adminDslSaveStatus" style={{ ...type.meta, color: color.ink, fontWeight: 800, background: color.cream, border: `1px solid ${color.rule}`, borderRadius: radius.pill, padding: "6px 10px", justifySelf: "start" }}>{str(props, "status", "Ready")}</span>{jsonObject(props, "primary") && renderActions(node, ctx, [jsonObject(props, "primary") as unknown as AdminActionRef])}</div>;

    case "calendarWeek":
      return <AdminCalendarWeek key={key} node={node} context={ctx} attrs={common} />;

    case "appointmentBlock":
    case "availabilityBlock":
    case "timeOffBlock":
      return (
        <button key={key} {...common} type="button" onClick={() => actionList(props)[0] && dispatch(ctx, node, actionList(props)[0])} style={{ textAlign: "left", border: `1px solid ${node.kind === "timeOffBlock" ? color.warn : color.plum}`, background: node.kind === "timeOffBlock" ? "#fbefcf" : color.paper, borderRadius: radius.md, padding: 12, boxShadow: shadow.sm, cursor: "pointer", ...style(props) }}>
          <strong style={{ ...type.body, display: "block" }}>{str(props, "clientName", str(props, "title", "Appointment"))}</strong>
          <span style={{ ...type.bodySm, color: color.softInk }}>{str(props, "service", str(props, "status"))}</span>
          <span style={{ ...type.meta, display: "block", marginTop: 6 }}>{str(props, "startsAt")} – {str(props, "endsAt")}</span>
        </button>
      );

    case "inlineError":
      return <div key={key} {...common} style={{ border: `1px solid ${color.danger}`, color: color.danger, padding: 12, borderRadius: radius.md, ...type.body }}>{str(props, "title", "Something went wrong")}</div>;

    default:
      return <pre key={key} {...common} style={{ padding: 12, background: color.cream, overflow: "auto" }}>{JSON.stringify(node, null, 2)}</pre>;
  }
}

function renderInlineNode(node: AdminJsonObject | undefined, ctx?: AdminRenderContext) {
  if (!node || typeof node.kind !== "string") return null;
  return renderAdminNode(node as unknown as AdminNode, ctx, String(node.kind));
}

function FieldPreview({ node }: { node: AdminNode }) {
  const props = node.props || {};
  const label = str(props, "label", str(props, "name"));
  const value = props.value;
  const inputStyle: CSSProperties = { border: `1px solid ${color.rule}`, borderRadius: radius.md, padding: "10px 12px", background: color.paper, ...type.body };

  return (
    <label {...dataAttrs(node)} style={{ display: "grid", gap: 6 }}>
      <span style={{ ...type.meta, color: color.softInk }}>{label}</span>
      {node.kind === "switchField" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...type.body }}><span style={{ width: 34, height: 20, borderRadius: radius.pill, background: value ? color.success : color.rule, display: "inline-block" }} />{value ? "On" : "Off"}</span>
      ) : node.kind === "textareaField" ? (
        <textarea readOnly value={typeof value === "string" ? value : ""} style={{ ...inputStyle, minHeight: 76 }} />
      ) : node.kind === "selectField" ? (
        <select disabled style={inputStyle}><option>{String(value || "Choose...")}</option></select>
      ) : node.kind === "imageField" ? (
        <div style={{ ...inputStyle, borderStyle: "dashed", color: color.softInk }}>Image upload field</div>
      ) : (
        <input readOnly value={value == null ? "" : String(value)} style={inputStyle} />
      )}
    </label>
  );
}

const responsiveCss = `
  .adminDslRoot { box-sizing: border-box; }
  .adminDslRoot *, .adminDslRoot *::before, .adminDslRoot *::after { box-sizing: border-box; }
  .adminDslGrid { grid-template-columns: var(--admin-dsl-grid-columns, 1fr); }
  .adminDslTitle { text-wrap: balance; overflow-wrap: anywhere; }
  .adminDslSideColumn { min-width: 0; }
  @media (max-width: 720px) {
    .adminDslRoot { padding: 16px !important; }
    .adminDslGrid { grid-template-columns: 1fr !important; gap: 16px !important; }
    .adminDslTitle { font-size: clamp(30px, 11vw, 40px) !important; line-height: 0.96 !important; letter-spacing: -0.25px !important; }
    .adminDslSectionTitle { font-size: clamp(20px, 7vw, 24px) !important; line-height: 1.05 !important; }
    .adminDslActionButton { min-height: 44px !important; flex: 1 1 132px !important; justify-content: center !important; }
    .adminDslSplitPane { grid-template-columns: 1fr !important; }
    .adminDslFilterPill { min-height: 44px !important; padding-inline: 14px !important; }
    .adminDslSaveBar { display: grid !important; grid-template-columns: 1fr !important; align-items: stretch !important; }
    .adminDslSurfaceKicker { display: none !important; }
    .adminDslCalendarScroller { display: none !important; }
    .adminDslCalendarAgenda { display: grid !important; }
    .adminDslResourceRow { grid-template-columns: 1fr !important; gap: 12px !important; padding: 14px !important; }
    .adminDslOverlaySurface { max-height: 82dvh !important; overflow: auto !important; border-radius: 14px !important; }
    .adminDslSideColumn { display: grid !important; grid-template-columns: 1fr !important; }
  }
  @media (max-width: 430px) {
    .adminDslRoot { padding: 12px !important; }
    .adminDslActionButton { flex-basis: 100% !important; }
  }
`;

export function AdminPageRenderer({ page, context }: { page: AdminPage; context?: AdminRenderContext }) {
  const shell = page.shell.kind;
  const sideNodes = [...(page.drawers || []), ...(page.modals || [])];

  return (
    <main className="adminDslRoot" style={{ minHeight: "100vh", background: shell === "calendar" ? color.cream : color.creamDeep, color: color.ink, fontFamily: font.sans, padding: 24 }} data-admin-dsl-page={page.id} data-admin-dsl-shell={shell}>
      <style>{responsiveCss}</style>
      <div className="adminDslGrid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", ["--admin-dsl-grid-columns" as string]: sideNodes.length ? "minmax(0, 1fr) 340px" : "1fr", gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          <header style={{ marginBottom: 24 }}>
            <div style={{ ...type.eyebrow, color: color.plum }}>{str(page.shell.props, "eyebrow", "Admin DSL")}</div>
            <h1 className="adminDslTitle" style={{ ...type.display2, fontSize: 56, margin: "6px 0 8px" }}>{page.title}</h1>
            {page.description && <p style={{ ...type.bodyLg, color: color.softInk, maxWidth: 680, margin: 0 }}>{page.description}</p>}
          </header>
          <div style={{ display: "grid", gap: 4 }}>{page.nodes.map((node, i) => renderAdminNode(node, context, nodeKey(node, i)))}</div>
        </div>
        {sideNodes.length > 0 && <div className="adminDslSideColumn" style={{ display: "grid", gap: 14, alignContent: "start" }}>{sideNodes.map((node, i) => renderAdminNode(node, context, nodeKey(node, i)))}</div>}
      </div>
    </main>
  );
}
