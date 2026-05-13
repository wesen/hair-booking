import { useEffect, useMemo, useState } from "react";
import { DslPageRenderer } from "./render";
import { DslApiError, getDslFlow, postDslEvent, startDslFlow, type DslFlowState, type DslInteractionEvent } from "./backendClient";
import type { DslBackendEvent } from "./schema";
import { color, font } from "../fringe-ui/tokens";

export interface BackendDslClient {
  startDslFlow: typeof startDslFlow;
  getDslFlow: typeof getDslFlow;
  postDslEvent: typeof postDslEvent;
}

const defaultClient: BackendDslClient = { startDslFlow, getDslFlow, postDslEvent };

export interface BackendDslPageProps {
  flowId?: string;
  sessionId?: string;
  client?: BackendDslClient;
  onStateChange?: (state: DslFlowState) => void;
  onEventDispatch?: (event: DslInteractionEvent) => void;
  onSessionRecovered?: (reason: string) => void;
}

export function BackendDslPage({
  flowId = "fringe.intake.v1",
  sessionId,
  client = defaultClient,
  onStateChange,
  onEventDispatch,
  onSessionRecovered,
}: BackendDslPageProps) {
  const [state, setState] = useState<DslFlowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        let nextState: DslFlowState;
        try {
          nextState = sessionId ? await client.getDslFlow(sessionId) : await client.startDslFlow(flowId);
        } catch (err) {
          if (sessionId && err instanceof DslApiError && err.code === "dsl_session_not_found") {
            onSessionRecovered?.(err.message);
            nextState = await client.startDslFlow(flowId);
          } else {
            throw err;
          }
        }

        if (cancelled) return;
        setState(nextState);
        onStateChange?.(nextState);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [client, flowId, onSessionRecovered, onStateChange, sessionId]);

  const context = useMemo(() => ({
    backendDispatch: async (event: DslBackendEvent) => {
      if (!state) return;
      setDispatching(true);
      setError(null);
      try {
        const interactionEvent: DslInteractionEvent = {
          ...event,
          eventId: crypto.randomUUID(),
          pageVersion: state.pageVersion,
        };
        onEventDispatch?.(interactionEvent);
        const nextState = await client.postDslEvent(state.sessionId, interactionEvent);
        setState(nextState);
        onStateChange?.(nextState);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setDispatching(false);
      }
    },
  }), [client, onEventDispatch, onStateChange, state]);

  if (loading) {
    return <BackendDslStatus label="Loading backend DSL flow…" />;
  }

  if (error && !state) {
    return <BackendDslStatus tone="danger" label={error} />;
  }

  if (!state) {
    return <BackendDslStatus tone="danger" label="Backend DSL flow did not return a page." />;
  }

  return (
    <div data-component="BackendDslPage" style={{ height: "100%", position: "relative" }}>
      <DslPageRenderer page={state.page} context={context} />
      {(dispatching || error || state.effects?.length) ? (
        <div
          data-component="BackendDslPageStatus"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 18,
            padding: "8px 10px",
            borderRadius: 6,
            background: error ? "#fce4dd" : color.cream,
            color: error ? color.danger : color.softInk,
            fontFamily: font.mono,
            fontSize: 10,
            letterSpacing: 0.2,
            boxShadow: "0 8px 20px rgba(17,17,17,0.08)",
            pointerEvents: "none",
          }}
        >
          {dispatching ? "Dispatching backend event…" : error || state.effects?.map((effect) => effect.message || effect.kind).join(" · ")}
        </div>
      ) : null}
    </div>
  );
}

function BackendDslStatus({ label, tone = "info" }: { label: string; tone?: "info" | "danger" }) {
  return (
    <div
      data-component="BackendDslStatus"
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: color.paper,
        color: tone === "danger" ? color.danger : color.softInk,
        fontFamily: font.mono,
        fontSize: 12,
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}
