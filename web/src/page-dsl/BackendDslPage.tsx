import { useEffect, useMemo, useState } from "react";
import { DslPageRenderer } from "./render";
import { getDslFlow, postDslEvent, startDslFlow, type DslFlowState } from "./backendClient";
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
}

export function BackendDslPage({
  flowId = "fringe.intake.v1",
  sessionId,
  client = defaultClient,
  onStateChange,
}: BackendDslPageProps) {
  const [state, setState] = useState<DslFlowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const promise = sessionId ? client.getDslFlow(sessionId) : client.startDslFlow(flowId);
    promise
      .then((nextState) => {
        if (cancelled) return;
        setState(nextState);
        onStateChange?.(nextState);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, flowId, onStateChange, sessionId]);

  const context = useMemo(() => ({
    backendDispatch: async (event: DslBackendEvent) => {
      if (!state) return;
      setDispatching(true);
      setError(null);
      try {
        const nextState = await client.postDslEvent(state.sessionId, {
          ...event,
          eventId: crypto.randomUUID(),
          pageVersion: state.pageVersion,
        });
        setState(nextState);
        onStateChange?.(nextState);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setDispatching(false);
      }
    },
  }), [client, onStateChange, state]);

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
