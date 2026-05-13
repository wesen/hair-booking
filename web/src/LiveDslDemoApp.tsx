import { useMemo, useState } from "react";
import { BackendDslPage, type DslFlowState } from "./page-dsl";
import { color, font, shadow } from "./fringe-ui/tokens";

export function LiveDslDemoApp() {
  const [flowState, setFlowState] = useState<DslFlowState | null>(null);
  const routeLabel = useMemo(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "/dsl-goja-demo") return "/dsl-goja-demo";
    return path;
  }, []);

  return (
    <main
      data-component="LiveDslDemoApp"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: `radial-gradient(circle at top left, ${color.peachSoft} 0, transparent 34%), ${color.cream}`,
      }}
    >
      <section
        data-component="LiveDslDemoShell"
        style={{
          width: "min(100%, 980px)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          data-component="LiveDslPhoneFrame"
          style={{
            width: 390,
            height: 844,
            maxWidth: "calc(100vw - 48px)",
            borderRadius: 48,
            overflow: "hidden",
            border: `8px solid ${color.ink}`,
            background: color.paper,
            boxShadow: shadow.lg,
            flex: "0 0 auto",
          }}
        >
          <BackendDslPage flowId="fringe.intake.v1" onStateChange={setFlowState} />
        </div>

        <aside
          data-component="LiveDslDebugPanel"
          style={{
            padding: 24,
            border: `1px solid ${color.rule}`,
            borderRadius: 18,
            background: "rgba(255,255,255,0.74)",
            boxShadow: shadow.md,
            color: color.ink,
            flex: "1 1 300px",
          }}
        >
          <p style={{ margin: "0 0 8px", fontFamily: font.mono, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: color.plum }}>
            Live backend DSL route
          </p>
          <h1 style={{ margin: "0 0 12px", fontFamily: font.block, fontSize: 42, lineHeight: 0.92, letterSpacing: 0.3, textTransform: "uppercase" }}>
            Goja drives the page
          </h1>
          <p style={{ margin: "0 0 18px", fontFamily: font.serif, fontSize: 20, lineHeight: 1.35, fontStyle: "italic", color: color.softInk }}>
            This page is the first real Vite app surface for the backend-driven DSL runtime. The phone frame renders JSON from the Go server, and widget clicks post opaque action ids back to Goja callbacks.
          </p>

          <dl style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr)", gap: "8px 12px", margin: "0 0 18px", fontFamily: font.mono, fontSize: 11 }}>
            <dt style={{ color: color.softInk }}>Route</dt>
            <dd style={{ margin: 0 }}>{routeLabel}</dd>
            <dt style={{ color: color.softInk }}>Flow</dt>
            <dd style={{ margin: 0 }}>fringe.intake.v1</dd>
            <dt style={{ color: color.softInk }}>Session</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{flowState?.sessionId ?? "starting…"}</dd>
            <dt style={{ color: color.softInk }}>Version</dt>
            <dd style={{ margin: 0 }}>{flowState?.pageVersion ?? "—"}</dd>
            <dt style={{ color: color.softInk }}>Page</dt>
            <dd style={{ margin: 0 }}>{flowState?.page.id ?? "loading"}</dd>
          </dl>

          <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
            <DebugStep done={!!flowState} label="Backend flow started through POST /api/dsl/flows/fringe.intake.v1/start" />
            <DebugStep done={flowState?.page.id === "intake-color"} label="Shell action dispatched and color step returned" />
            <DebugStep done={!!flowState?.effects?.length} label="Backend effects returned" muted />
          </div>

          <details>
            <summary style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: color.plum }}>
              Current page JSON
            </summary>
            <pre
              style={{
                maxHeight: 280,
                overflow: "auto",
                margin: "10px 0 0",
                padding: 12,
                borderRadius: 8,
                background: color.ink,
                color: color.cream,
                fontFamily: font.mono,
                fontSize: 10,
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(flowState?.page ?? { status: "loading" }, null, 2)}
            </pre>
          </details>
        </aside>
      </section>
    </main>
  );
}

function DebugStep({ done, label, muted = false }: { done: boolean; label: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: font.mono, fontSize: 10, color: muted && !done ? color.soft : color.softInk }}>
      <span aria-hidden="true" style={{ color: done ? color.success : color.soft }}>{done ? "●" : "○"}</span>
      <span>{label}</span>
    </div>
  );
}
