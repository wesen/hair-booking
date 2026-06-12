import { useMemo, useState } from "react";
import { http, HttpResponse, type HttpHandler } from "msw";
import { AdminPageRenderer } from "./render";
import type { AdminActionRef, AdminPage, AdminRenderEvent } from "./schema";

export type AdminScenarioStatus = "success" | "validation" | "authorization" | "server" | "stale";

export interface AdminScenarioTransition<S extends string> {
  target: string;
  to?: S;
  status?: AdminScenarioStatus;
  latencyMs?: number;
  message?: string;
}

export interface AdminScenarioDefinition<S extends string> {
  endpoint: string;
  initialState: S;
  renderPage: (state: S) => AdminPage;
  transitions: AdminScenarioTransition<S>[];
  fallbackState?: S;
}

export interface AdminScenarioResponse<S extends string> {
  state: S;
  page: AdminPage;
  effects: Array<{ kind: string; tone?: string; message?: string }>;
  error?: { code: string; message: string };
}

function transitionFor<S extends string>(definition: AdminScenarioDefinition<S>, target: string) {
  return definition.transitions.find((transition) => transition.target === target);
}

export function responseForAdminScenario<S extends string>(
  definition: AdminScenarioDefinition<S>,
  currentState: S,
  action: Pick<AdminActionRef, "target"> | undefined,
): AdminScenarioResponse<S> {
  const target = action?.target || "";
  const transition = transitionFor(definition, target);
  const status = transition?.status || "success";
  const state = transition?.to || definition.fallbackState || currentState || definition.initialState;
  const message = transition?.message || `Handled ${target || "unknown action"}`;
  const tone = status === "success" ? "success" : status === "stale" ? "info" : "danger";
  return {
    state,
    page: definition.renderPage(state),
    effects: [{ kind: "toast", tone, message }],
    ...(status === "success" ? {} : { error: { code: `admin_dsl_${status}`, message } }),
  };
}

export function createAdminScenarioHandlers<S extends string>(definition: AdminScenarioDefinition<S>): HttpHandler[] {
  return [
    http.get(definition.endpoint, ({ request }) => {
      const url = new URL(request.url);
      const state = (url.searchParams.get("state") || definition.initialState) as S;
      return HttpResponse.json({ state, page: definition.renderPage(state), effects: [] });
    }),
    http.post(`${definition.endpoint}/events`, async ({ request }) => {
      const body = await request.json() as { state?: S; action?: AdminActionRef; latencyMs?: number };
      const transition = transitionFor(definition, body.action?.target || "");
      const latencyMs = body.latencyMs ?? transition?.latencyMs ?? 0;
      if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));
      return HttpResponse.json(responseForAdminScenario(definition, body.state || definition.initialState, body.action));
    }),
  ];
}

export function AdminScenarioHarness<S extends string>({
  definition,
  initialState,
  className,
}: {
  definition: AdminScenarioDefinition<S>;
  initialState?: S;
  className?: string;
}) {
  const [state, setState] = useState<S>(initialState || definition.initialState);
  const [page, setPage] = useState(() => definition.renderPage(initialState || definition.initialState));
  const [events, setEvents] = useState<AdminRenderEvent[]>([]);
  const [lastEffect, setLastEffect] = useState<string>("Ready");
  const context = useMemo(() => ({
    dispatch: async (event: AdminRenderEvent) => {
      setEvents((current) => [event, ...current].slice(0, 6));
      const response = await fetch(`${definition.endpoint}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, action: event.action }),
      });
      const result = await response.json() as AdminScenarioResponse<S>;
      setState(result.state);
      setPage(result.page);
      setLastEffect(result.error?.message || result.effects[0]?.message || "No effect");
    },
  }), [definition, state]);

  return (
    <div className={className}>
      <AdminPageRenderer page={page} context={context} />
      <aside style={{ position: "fixed", right: 12, bottom: 12, zIndex: 10, maxWidth: 390, background: "rgba(255,255,255,0.96)", border: "1px solid #ddd", borderRadius: 12, padding: 12, fontFamily: "monospace", fontSize: 11 }}>
        <strong>Admin DSL scenario harness</strong>
        <div>state: {state}</div>
        <div>effect: {lastEffect}</div>
        <pre style={{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}>{JSON.stringify(events.map((event) => ({ nodeKind: event.nodeKind, target: event.action.target })), null, 2)}</pre>
      </aside>
    </div>
  );
}
