import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageRenderer } from "./render";
import { getAdminDslFlow, postAdminDslEvent, startAdminDslFlow, type AdminDslFlowState, type AdminDslInteractionEvent } from "./backendClient";
import type { AdminRenderEvent } from "./schema";
import { color, font, radius, type } from "../fringe-ui/tokens";

const DEFAULT_FLOW_ID = "fringe.admin.services.v1";

function sessionStorageKey(flowId: string) {
  return `fringe.admin-dsl.${flowId}.sessionId`;
}

function readStoredSessionId(flowId: string) {
  try { return window.sessionStorage.getItem(sessionStorageKey(flowId)) || undefined; } catch { return undefined; }
}

function writeStoredSessionId(flowId: string, sessionId: string) {
  try { window.sessionStorage.setItem(sessionStorageKey(flowId), sessionId); } catch { /* ignore */ }
}

function clearStoredSessionId(flowId: string) {
  try { window.sessionStorage.removeItem(sessionStorageKey(flowId)); } catch { /* ignore */ }
}

export function adminInteractionEventFromRenderEvent(renderEvent: AdminRenderEvent, pageVersion: number): AdminDslInteractionEvent {
  const actionId = typeof renderEvent.action.id === "string" ? renderEvent.action.id : "";
  if (!actionId) {
    throw new Error(`Admin DSL backend action ${renderEvent.action.target || renderEvent.action.type} is missing opaque id`);
  }
  return {
    eventId: crypto.randomUUID(),
    pageVersion,
    nodeId: renderEvent.nodeId,
    nodeKind: renderEvent.nodeKind,
    actionId,
    event: typeof renderEvent.action.event === "string" && renderEvent.action.event ? renderEvent.action.event : "click",
    value: renderEvent.value,
    meta: renderEvent.meta && typeof renderEvent.meta === "object" && !Array.isArray(renderEvent.meta) ? renderEvent.meta as Record<string, unknown> : undefined,
  };
}

function StatusPanel({ title, body, action }: { title: string; body?: string; action?: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: color.creamDeep, color: color.ink, fontFamily: font.sans, padding: 24 }}>
      <section style={{ maxWidth: 520, border: `1px solid ${color.rule}`, borderRadius: radius.lg, background: color.paper, padding: 24 }}>
        <h1 style={{ ...type.h1, margin: 0 }}>{title}</h1>
        {body && <p style={{ ...type.body, color: color.softInk }}>{body}</p>}
        {action && <button type="button" onClick={action} style={{ minHeight: 42, borderRadius: radius.pill, border: `1px solid ${color.ink}`, background: color.ink, color: color.paper, padding: "8px 14px", fontFamily: font.mono }}>Restart admin flow</button>}
      </section>
    </main>
  );
}

export function BackendAdminDslPage({ flowId = DEFAULT_FLOW_ID }: { flowId?: string }) {
  const [flowState, setFlowState] = useState<AdminDslFlowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const start = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      clearStoredSessionId(flowId);
      const next = await startAdminDslFlow(flowId);
      writeStoredSessionId(flowId, next.sessionId);
      setFlowState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }, [flowId]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setPending(true);
      try {
        const existing = readStoredSessionId(flowId);
        const next = existing ? await getAdminDslFlow(existing) : await startAdminDslFlow(flowId);
        if (cancelled) return;
        writeStoredSessionId(flowId, next.sessionId);
        setFlowState(next);
      } catch (err) {
        if (cancelled) return;
        clearStoredSessionId(flowId);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setPending(false);
      }
    }
    void boot();
    return () => { cancelled = true; };
  }, [flowId]);

  const dispatch = useCallback(async (event: AdminRenderEvent) => {
    if (!flowState) return;
    setPending(true);
    setError(null);
    try {
      const next = await postAdminDslEvent(flowState.sessionId, adminInteractionEventFromRenderEvent(event, flowState.pageVersion));
      writeStoredSessionId(flowId, next.sessionId);
      setFlowState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }, [flowId, flowState]);

  const effectText = useMemo(() => flowState?.effects?.map((effect) => effect.message).filter(Boolean).join(" · "), [flowState?.effects]);

  if (!flowState && pending) return <StatusPanel title="Loading admin services" body="Starting the backend Admin DSL flow." />;
  if (!flowState && error) return <StatusPanel title="Admin flow unavailable" body={error} action={start} />;
  if (!flowState) return <StatusPanel title="Admin flow" body="Preparing the backend Admin DSL page." />;

  return (
    <div>
      {pending && <div style={{ position: "fixed", top: 12, right: 12, zIndex: 20, borderRadius: radius.pill, background: color.ink, color: color.paper, padding: "8px 12px", fontFamily: font.mono, fontSize: 12 }}>Updating…</div>}
      {error && <div style={{ position: "fixed", top: 12, left: 12, zIndex: 20, borderRadius: radius.md, background: color.paper, color: color.danger, border: `1px solid ${color.danger}`, padding: "8px 12px", fontFamily: font.mono, fontSize: 12 }}>{error}</div>}
      {effectText && <div style={{ position: "fixed", bottom: 12, left: 12, zIndex: 20, borderRadius: radius.md, background: color.paper, color: color.ink, border: `1px solid ${color.rule}`, padding: "8px 12px", fontFamily: font.mono, fontSize: 12 }}>{effectText}</div>}
      <AdminPageRenderer page={flowState.page} context={{ dispatch }} />
    </div>
  );
}
