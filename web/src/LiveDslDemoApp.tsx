import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackendDslPage, type DslFlowState, type DslInteractionEvent } from "./page-dsl";
import { color, font, shadow } from "./fringe-ui/tokens";

const FLOW_ID = "fringe.intake.v1";
const SESSION_STORAGE_KEY = `fringe.dsl.${FLOW_ID}.sessionId`;
const DESKTOP_BREAKPOINT = 1080;

const pageSlugById: Record<string, string> = {
  "intake-service": "service",
  "intake-color": "color",
  "intake-photos": "photos",
  "intake-budget": "budget",
  "intake-estimate": "estimate",
  "intake-booking": "booking",
  "intake-confirm": "confirm",
};

function readStoredSessionId() {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

function writeStoredSessionId(sessionId: string) {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // sessionStorage can be unavailable in restrictive browser modes.
  }
}

function clearStoredSessionId() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function slugForPage(pageId: string) {
  return pageSlugById[pageId] || pageId.replace(/^intake-/, "");
}

function routeForPage(pageId: string) {
  return `/dsl-goja-demo/${slugForPage(pageId)}`;
}

const VIEW_PREF_KEY = "fringe.dsl.viewPref";

type ViewPref = "auto" | "mobile" | "desktop";

function readViewPref(): ViewPref {
  try {
    const v = window.localStorage.getItem(VIEW_PREF_KEY);
    if (v === "mobile" || v === "desktop") return v;
  } catch { /* ignore */ }
  return "auto";
}

function writeViewPref(pref: ViewPref) {
  try { window.localStorage.setItem(VIEW_PREF_KEY, pref); } catch { /* ignore */ }
}

function useIsDesktop() {
  const [pref, setPref] = useState<ViewPref>(readViewPref);
  const [nativeDesktop, setNativeDesktop] = useState(() => window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setNativeDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDesktop = pref === "desktop" ? true : pref === "mobile" ? false : nativeDesktop;
  const cyclePref = useCallback(() => {
    const next = isDesktop ? "mobile" : "desktop";
    setPref(next);
    writeViewPref(next);
  }, [isDesktop]);
  const resetPref = useCallback(() => {
    setPref("auto");
    writeViewPref("auto");
  }, []);

  return { isDesktop, pref, cyclePref, resetPref };
}

export function LiveDslDemoApp() {
  const [initialSessionId] = useState(() => readStoredSessionId());
  const [flowState, setFlowState] = useState<DslFlowState | null>(null);
  const [lastEvent, setLastEvent] = useState<DslInteractionEvent | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const previousPageId = useRef<string | null>(null);
  const { isDesktop, pref, cyclePref, resetPref } = useIsDesktop();

  const handleStateChange = useCallback((nextState: DslFlowState) => {
    setFlowState(nextState);
    writeStoredSessionId(nextState.sessionId);

    const nextPath = routeForPage(nextState.page.id);
    const currentPath = window.location.pathname;
    const previous = previousPageId.current;
    const historyState = { sessionId: nextState.sessionId, pageVersion: nextState.pageVersion, pageId: nextState.page.id };

    if (currentPath !== nextPath) {
      if (previous && previous !== nextState.page.id) {
        window.history.pushState(historyState, "", nextPath);
      } else {
        window.history.replaceState(historyState, "", nextPath);
      }
    }

    previousPageId.current = nextState.page.id;
  }, []);

  const handleSessionRecovered = useCallback((reason: string) => {
    clearStoredSessionId();
    setRecoveryMessage(`Previous session could not be resumed: ${reason}`);
  }, []);

  const currentJson = useMemo(() => JSON.stringify(flowState?.page ?? { status: "loading" }, null, 2), [flowState?.page]);
  const routeLabel = flowState ? routeForPage(flowState.page.id) : window.location.pathname;

  const copyCurrentJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [currentJson]);

  // ── Desktop layout ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <div
        data-component="LiveDslDemoApp"
        style={{ height: "100vh", display: "flex", background: color.paper, fontFamily: font.sans }}
      >
        {/* Main content: full-width DSL renderer in desktop mode */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <BackendDslPage
            flowId={FLOW_ID}
            sessionId={initialSessionId}
            onStateChange={handleStateChange}
            onEventDispatch={setLastEvent}
            onSessionRecovered={handleSessionRecovered}
            forceDesktop
          />
        </div>

        {/* Debug panel toggle button */}
        <button
          type="button"
          data-component="DebugPanelToggle"
          onClick={() => setDebugOpen((o) => !o)}
          style={{
            position: "fixed",
            right: debugOpen ? 380 : 16,
            top: 16,
            zIndex: 100,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `1px solid ${color.rule}`,
            background: color.paper,
            boxShadow: shadow.md,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.mono,
            fontSize: 14,
            color: color.softInk,
            transition: "right 0.2s ease",
          }}
          aria-label={debugOpen ? "Close debug panel" : "Open debug panel"}
        >
          {debugOpen ? "×" : "⟩"}
        </button>

        {/* Debug drawer (slides in from right) */}
        <div
          data-component="LiveDslDebugPanel"
          style={{
            width: debugOpen ? 380 : 0,
            overflow: "hidden",
            borderLeft: debugOpen ? `1px solid ${color.rule}` : "none",
            background: "rgba(255,255,255,0.94)",
            boxShadow: debugOpen ? shadow.lg : "none",
            transition: "width 0.2s ease, border-color 0.2s ease",
            flexShrink: 0,
          }}
        >
          <div style={{ width: 380, padding: 24, height: "100%", overflow: "auto" }}>
            <p style={{ margin: "0 0 8px", fontFamily: font.mono, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: color.plum }}>
              Desktop mode · live backend DSL
            </p>
            <h1 style={{ margin: "0 0 12px", fontFamily: font.block, fontSize: 32, lineHeight: 0.92, letterSpacing: 0.3, textTransform: "uppercase" }}>
              Goja drives the page
            </h1>
            <p style={{ margin: "0 0 18px", fontFamily: font.serif, fontSize: 17, lineHeight: 1.35, fontStyle: "italic", color: color.softInk }}>
              Same JSON, different density. Wide viewport shows the desktop shell with two-column layout and accent panel. Narrow viewport shows the mobile intake shell.
            </p>

            <ViewModeIndicator isDesktop={isDesktop} pref={pref} onToggle={cyclePref} onReset={resetPref} />

            {recoveryMessage ? <DebugNotice tone="warn" message={recoveryMessage} /> : null}
            {flowState?.effects?.map((effect, index) => (
              <DebugNotice key={`${effect.kind}:${index}`} tone={effect.tone === "danger" ? "danger" : effect.tone === "warn" ? "warn" : "info"} message={effect.message || effect.kind} />
            ))}

            <dl style={{ display: "grid", gridTemplateColumns: "100px minmax(0, 1fr)", gap: "8px 12px", margin: "0 0 18px", fontFamily: font.mono, fontSize: 11 }}>
              <dt style={{ color: color.softInk }}>Route</dt>
              <dd style={{ margin: 0 }}>{routeLabel}</dd>
              <dt style={{ color: color.softInk }}>Shell</dt>
              <dd style={{ margin: 0, color: color.plum }}>desktop (forced)</dd>
              <dt style={{ color: color.softInk }}>Session</dt>
              <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{flowState?.sessionId ?? initialSessionId ?? "starting…"}</dd>
              <dt style={{ color: color.softInk }}>Version</dt>
              <dd style={{ margin: 0 }}>{flowState?.pageVersion ?? "—"}</dd>
              <dt style={{ color: color.softInk }}>Page</dt>
              <dd style={{ margin: 0 }}>{flowState?.page.id ?? "loading"}</dd>
            </dl>

            <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
              <DebugStep done={!!flowState} label="Backend flow started or resumed" />
              <DebugStep done={!!lastEvent} label="At least one interaction event posted" />
              <DebugStep done={!!flowState?.effects?.length} label="Backend effects returned" muted />
            </div>

            <details style={{ marginBottom: 12 }}>
              <summary style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: color.plum }}>
                Current page JSON
              </summary>
              <button
                type="button"
                onClick={copyCurrentJson}
                style={{
                  marginTop: 10,
                  border: `1px solid ${color.plum}`,
                  background: copied ? color.sage : color.paper,
                  color: copied ? color.paper : color.plum,
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontFamily: font.mono,
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <pre style={preStyle}>{currentJson}</pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile layout (phone frame + side panel) ──────────────
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
          <BackendDslPage
            flowId={FLOW_ID}
            sessionId={initialSessionId}
            onStateChange={handleStateChange}
            onEventDispatch={setLastEvent}
            onSessionRecovered={handleSessionRecovered}
          />
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
          <ViewModeIndicator isDesktop={isDesktop} pref={pref} onToggle={cyclePref} onReset={resetPref} />

          <p style={{ margin: "0 0 8px", fontFamily: font.mono, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: color.plum }}>
            Live backend DSL route
          </p>
          <h1 style={{ margin: "0 0 12px", fontFamily: font.block, fontSize: 42, lineHeight: 0.92, letterSpacing: 0.3, textTransform: "uppercase" }}>
            Goja drives the page
          </h1>
          <p style={{ margin: "0 0 18px", fontFamily: font.serif, fontSize: 20, lineHeight: 1.35, fontStyle: "italic", color: color.softInk }}>
            This page is the first real Vite app surface for the backend-driven DSL runtime. The phone frame renders JSON from the Go server, and widget clicks post opaque action ids back to Goja callbacks.
          </p>

          {recoveryMessage ? <DebugNotice tone="warn" message={recoveryMessage} /> : null}
          {flowState?.effects?.map((effect, index) => (
            <DebugNotice key={`${effect.kind}:${index}`} tone={effect.tone === "danger" ? "danger" : effect.tone === "warn" ? "warn" : "info"} message={effect.message || effect.kind} />
          ))}

          <dl style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr)", gap: "8px 12px", margin: "0 0 18px", fontFamily: font.mono, fontSize: 11 }}>
            <dt style={{ color: color.softInk }}>Route</dt>
            <dd style={{ margin: 0 }}>{routeLabel}</dd>
            <dt style={{ color: color.softInk }}>Flow</dt>
            <dd style={{ margin: 0 }}>{FLOW_ID}</dd>
            <dt style={{ color: color.softInk }}>Session</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{flowState?.sessionId ?? initialSessionId ?? "starting…"}</dd>
            <dt style={{ color: color.softInk }}>Version</dt>
            <dd style={{ margin: 0 }}>{flowState?.pageVersion ?? "—"}</dd>
            <dt style={{ color: color.softInk }}>Page</dt>
            <dd style={{ margin: 0 }}>{flowState?.page.id ?? "loading"}</dd>
          </dl>

          <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
            <DebugStep done={!!flowState} label="Backend flow started or resumed through /api/dsl/flows" />
            <DebugStep done={flowState?.page.id === "intake-color"} label="Shell action dispatched and color step returned" />
            <DebugStep done={!!lastEvent} label="At least one backend interaction event was posted" />
            <DebugStep done={!!flowState?.effects?.length} label="Backend effects returned" muted />
          </div>

          <details style={{ marginBottom: 12 }}>
            <summary style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: color.plum }}>
              Last backend event
            </summary>
            <pre style={preStyle}>
              {JSON.stringify(lastEvent ?? { status: "no event dispatched yet" }, null, 2)}
            </pre>
          </details>

          <details>
            <summary style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: color.plum }}>
              Current page JSON
            </summary>
            <button
              type="button"
              onClick={copyCurrentJson}
              style={{
                marginTop: 10,
                border: `1px solid ${color.plum}`,
                background: copied ? color.sage : color.paper,
                color: copied ? color.paper : color.plum,
                borderRadius: 999,
                padding: "6px 10px",
                fontFamily: font.mono,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied" : "Copy JSON"}
            </button>
            <pre style={preStyle}>{currentJson}</pre>
          </details>
        </aside>
      </section>
    </main>
  );
}

/** Clickable badge showing + toggling current view mode */
function ViewModeIndicator({ isDesktop, pref, onToggle, onReset }: {
  isDesktop: boolean;
  pref: ViewPref;
  onToggle: () => void;
  onReset: () => void;
}) {
  const label = isDesktop ? "Desktop view" : "Mobile view";
  const icon = isDesktop ? "🖥" : "📱";
  const toggleLabel = isDesktop ? "Switch to mobile" : "Switch to desktop";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: isDesktop ? color.plum : color.creamDeep,
          color: isDesktop ? color.paper : color.plum,
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 13 }}>{icon}</span>
        {label}
      </div>
      <button
        type="button"
        onClick={onToggle}
        title={toggleLabel}
        style={{
          border: `1px solid ${color.rule}`,
          background: color.paper,
          borderRadius: 999,
          padding: "5px 10px",
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: color.softInk,
          cursor: "pointer",
        }}
      >{toggleLabel}</button>
      {pref !== "auto" && (
        <button
          type="button"
          onClick={onReset}
          title="Reset to auto"
          style={{
            border: "none",
            background: "transparent",
            fontFamily: font.mono,
            fontSize: 10,
            color: color.soft,
            cursor: "pointer",
            padding: "4px 6px",
            textDecoration: "underline",
          }}
        >auto</button>
      )}
    </div>
  );
}

const preStyle = {
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
} as const;

function DebugNotice({ tone, message }: { tone: "info" | "warn" | "danger"; message: string }) {
  const palette = tone === "danger"
    ? { bg: "#fce4dd", fg: color.danger }
    : tone === "warn"
      ? { bg: "#fbefcf", fg: color.ochre }
      : { bg: color.cream, fg: color.softInk };
  return (
    <div style={{ margin: "0 0 12px", padding: "8px 10px", borderRadius: 8, background: palette.bg, color: palette.fg, fontFamily: font.mono, fontSize: 10 }}>
      {message}
    </div>
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
